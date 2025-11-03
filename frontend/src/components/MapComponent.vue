<template>
  <div class="map-container">
    <div v-if="!settingsStore.getMapApiKey" class="map-not-configured">
      <el-empty description="地图服务未配置">
        <template #description>
          <p>请在设置页面配置地图API密钥</p>
        </template>
        <el-button type="primary" @click="navigateToSettings">去配置</el-button>
      </el-empty>
    </div>
    
    <div v-else-if="loading" class="map-loading">
      <el-spinner size="large" />
      <p>地图加载中...</p>
    </div>
    
    <div v-else class="map-wrapper">
      <div :id="mapId" class="map" :style="{ height: height }"></div>
      
      <!-- 地图控制器 -->
      <div v-if="showControls" class="map-controls">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索地点"
          suffix-icon="el-icon-search"
          @keyup.enter="handleSearch"
          class="search-input"
        />
        
        <div class="control-buttons">
          <el-button 
            type="primary" 
            size="small" 
            @click="handleSearch"
            :loading="searching"
          >
            搜索
          </el-button>
          
          <el-button 
            type="default" 
            size="small" 
            @click="resetMap"
          >
            重置
          </el-button>
        </div>
        
        <!-- 搜索结果 -->
        <div v-if="searchResults.length > 0" class="search-results">
          <div 
            v-for="(result, index) in searchResults" 
            :key="index"
            class="search-result-item"
            @click="selectSearchResult(result)"
          >
            <div class="result-title">{{ result.name }}</div>
            <div class="result-address">{{ result.address }}</div>
          </div>
        </div>
      </div>
      
      <!-- 信息窗口 -->
      <div v-if="selectedMarkerInfo" class="info-window">
        <div class="info-header">
          <h3>{{ selectedMarkerInfo.title }}</h3>
          <button class="close-btn" @click="closeInfoWindow">×</button>
        </div>
        <div class="info-content">
          <p v-if="selectedMarkerInfo.address">{{ selectedMarkerInfo.address }}</p>
          <p v-if="selectedMarkerInfo.description">{{ selectedMarkerInfo.description }}</p>
          <p v-if="selectedMarkerInfo.time">{{ selectedMarkerInfo.time }}</p>
          <p v-if="selectedMarkerInfo.cost !== undefined">费用: ¥{{ selectedMarkerInfo.cost }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useSettingsStore } from '../store/settings'
import mapService from '../services/mapService'

// Props
const props = defineProps({
  mapId: {
    type: String,
    default: 'map'
  },
  height: {
    type: String,
    default: '400px'
  },
  center: {
    type: Array,
    default: () => [116.397428, 39.90923] // 默认北京坐标
  },
  zoom: {
    type: Number,
    default: 13
  },
  markers: {
    type: Array,
    default: () => []
  },
  showControls: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['map-ready', 'marker-click', 'location-changed'])

// Store
const settingsStore = useSettingsStore()
const router = useRouter()

// Reactive data
const loading = ref(true)
const searching = ref(false)
const searchKeyword = ref('')
const searchResults = ref([])
const selectedMarkerInfo = ref(null)
const mapMarkers = ref([])
const mapBounds = ref(null)

// 初始化地图
const initMap = async () => {
  if (!settingsStore.getMapApiKey) {
    loading.value = false
    return
  }

  await nextTick()
  
  try {
    const map = await mapService.createMap(props.mapId, {
      center: props.center,
      zoom: props.zoom
    })
    
    if (map) {
      // 监听地图点击事件
      map.on('click', handleMapClick)
      
      // 添加地图控件
      addMapControls(map)
      
      // 添加初始标记
      if (props.markers.length > 0) {
        addMarkers(props.markers)
      }
      
      emit('map-ready', map)
    }
  } catch (error) {
    console.error('地图初始化失败:', error)
    ElMessage.error('地图加载失败，请重试')
  } finally {
    loading.value = false
  }
}

// 添加地图控件
const addMapControls = (map) => {
  map.addControl(new AMap.ToolBar())
  map.addControl(new AMap.Scale())
  map.addControl(new AMap.OverView())
}

// 处理地图点击
const handleMapClick = (e) => {
  const lnglat = e.lnglat
  emit('location-changed', { lng: lnglat.getLng(), lat: lnglat.getLat() })
}

// 添加标记
const addMarkers = (markers) => {
  // 清除现有标记
  clearMarkers()
  
  const map = mapService.getMap()
  if (!map) return
  
  const bounds = new AMap.Bounds()
  
  markers.forEach((markerData, index) => {
    const marker = mapService.addMarker({
      position: markerData.position || props.center,
      title: markerData.title || `标记${index + 1}`,
      icon: markerData.icon || '',
      label: markerData.label || {},
      extData: markerData
    })
    
    if (marker) {
      // 监听标记点击事件
      marker.on('click', () => handleMarkerClick(markerData))
      mapMarkers.value.push(marker)
      
      // 将标记添加到地图边界
      bounds.extend(marker.getPosition())
    }
  })
  
  // 如果有多个标记，自动调整地图视野
  if (mapMarkers.value.length > 1) {
    map.setFitView(mapMarkers.value, true, [50, 50, 50, 50])
  }
  
  mapBounds.value = bounds
}

// 清除所有标记
const clearMarkers = () => {
  mapMarkers.value.forEach(marker => {
    marker.setMap(null)
  })
  mapMarkers.value = []
}

// 处理标记点击
const handleMarkerClick = (markerData) => {
  selectedMarkerInfo.value = {
    title: markerData.title,
    address: markerData.address,
    description: markerData.description,
    time: markerData.time,
    cost: markerData.cost
  }
  emit('marker-click', markerData)
}

// 关闭信息窗口
const closeInfoWindow = () => {
  selectedMarkerInfo.value = null
}

// 搜索地点
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) return
  
  searching.value = true
  try {
    const results = await mapService.searchPlace(searchKeyword.value)
    searchResults.value = results
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请重试')
  } finally {
    searching.value = false
  }
}

// 选择搜索结果
const selectSearchResult = (result) => {
  const map = mapService.getMap()
  if (map) {
    // 移动到搜索结果位置
    map.setCenter([result.location.lng, result.location.lat])
    map.setZoom(15)
    
    // 添加标记
    mapService.addMarker({
      position: [result.location.lng, result.location.lat],
      title: result.name,
      extData: {
        title: result.name,
        address: result.address,
        location: result.location
      }
    })
    
    // 清除搜索结果
    searchResults.value = []
    searchKeyword.value = result.name
    
    // 触发位置变化事件
    emit('location-changed', {
      lng: result.location.lng,
      lat: result.location.lat
    })
  }
}

// 重置地图
const resetMap = () => {
  const map = mapService.getMap()
  if (map) {
    map.setCenter(props.center)
    map.setZoom(props.zoom)
  }
  searchKeyword.value = ''
  searchResults.value = []
  selectedMarkerInfo.value = null
}

// 导航到设置页面
const navigateToSettings = () => {
  router.push('/settings')
}

// 监听标记变化
watch(() => props.markers, (newMarkers) => {
  if (newMarkers && newMarkers.length > 0) {
    addMarkers(newMarkers)
  }
}, { deep: true })

// 生命周期
onMounted(() => {
  initMap()
})

onUnmounted(() => {
  mapService.destroyMap()
  clearMarkers()
})
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  min-height: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.map-not-configured,
.map-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  background: #f5f7fa;
}

.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.map {
  width: 100%;
}

.map-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  z-index: 1000;
  max-width: 300px;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.search-input {
  margin-bottom: 10px;
}

.control-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.search-results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.search-result-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f5f7fa;
}

.result-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.result-address {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

.info-window {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  max-width: 300px;
  z-index: 1001;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.info-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #909399;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-content p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .map-controls {
    max-width: calc(100% - 40px);
  }
  
  .info-window {
    left: 10px;
    right: 10px;
    transform: none;
    max-width: none;
  }
}
</style>