import { ref } from 'vue'
import { useSettingsStore } from '../store/settings'

class MapService {
  constructor() {
    this.settingsStore = useSettingsStore()
    this.mapLoaded = ref(false)
    this.mapInstance = null
    this.mapDOM = null
  }

  /**
   * 初始化地图服务
   * @param {Boolean} forceLoad - 是否强制加载地图SDK
   * @returns {Promise<Boolean>} 是否初始化成功
   */
  async init(forceLoad = false) {
    if (!this.settingsStore.getMapApiKey) {
      console.warn('地图API密钥未配置，请在设置页面配置')
      return false
    }

    if (this.mapLoaded.value && !forceLoad) {
      return true
    }

    try {
      await this.loadMapScript()
      this.mapLoaded.value = true
      console.log('地图服务初始化成功')
      return true
    } catch (error) {
      console.error('地图服务初始化失败:', error)
      this.mapLoaded.value = false
      return false
    }
  }

  /**
   * 加载地图脚本
   * @returns {Promise<void>}
   */
  loadMapScript() {
    return new Promise((resolve, reject) => {
      // 检查是否已经加载
      if (window.AMap) {
        resolve()
        return
      }

      const apiKey = this.settingsStore.getMapApiKey
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${apiKey}&callback=onMapLoaded`
      script.onerror = reject
      document.head.appendChild(script)

      // 全局回调函数
      window.onMapLoaded = () => {
        resolve()
      }
    })
  }

  /**
   * 创建地图实例
   * @param {HTMLElement|String} container - 地图容器或容器ID
   * @param {Object} options - 地图配置选项
   * @returns {AMap.Map|null} 地图实例
   */
  async createMap(container, options = {}) {
    if (!await this.init()) {
      return null
    }

    if (typeof container === 'string') {
      this.mapDOM = document.getElementById(container)
    } else {
      this.mapDOM = container
    }

    if (!this.mapDOM) {
      console.error('地图容器不存在')
      return null
    }

    const defaultOptions = {
      zoom: 13,
      center: [116.397428, 39.90923], // 默认北京坐标
      resizeEnable: true
    }

    try {
      this.mapInstance = new AMap.Map(this.mapDOM, {
        ...defaultOptions,
        ...options
      })
      return this.mapInstance
    } catch (error) {
      console.error('创建地图实例失败:', error)
      return null
    }
  }

  /**
   * 销毁地图实例
   */
  destroyMap() {
    if (this.mapInstance) {
      this.mapInstance.destroy()
      this.mapInstance = null
    }
    this.mapDOM = null
  }

  /**
   * 搜索地点
   * @param {String} keyword - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Array>} 搜索结果
   */
  async searchPlace(keyword, options = {}) {
    if (!await this.init()) {
      return []
    }

    return new Promise((resolve, reject) => {
      AMap.plugin('AMap.PlaceSearch', () => {
        const placeSearch = new AMap.PlaceSearch({
          city: options.city || '',
          pageSize: options.pageSize || 10,
          pageIndex: options.pageIndex || 1,
          ...options
        })

        placeSearch.search(keyword, (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            resolve(result.poiList.pois)
          } else {
            reject(new Error(`搜索失败: ${result.info}`))
          }
        })
      })
    })
  }

  /**
   * 地理编码 - 地址转坐标
   * @param {String} address - 地址
   * @param {String} city - 城市
   * @returns {Promise<Object|null>} 坐标信息
   */
  async geocode(address, city = '') {
    if (!await this.init()) {
      return null
    }

    return new Promise((resolve, reject) => {
      AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new AMap.Geocoder({
          city: city
        })

        geocoder.getLocation(address, (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            resolve(result.geocodes[0])
          } else {
            reject(new Error(`地理编码失败: ${result.info}`))
          }
        })
      })
    })
  }

  /**
   * 逆地理编码 - 坐标转地址
   * @param {Array} lnglat - 经纬度 [lng, lat]
   * @returns {Promise<Object|null>} 地址信息
   */
  async reverseGeocode(lnglat) {
    if (!await this.init()) {
      return null
    }

    return new Promise((resolve, reject) => {
      AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new AMap.Geocoder()

        geocoder.getAddress(lnglat, (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            resolve(result.regeocode)
          } else {
            reject(new Error(`逆地理编码失败: ${result.info}`))
          }
        })
      })
    })
  }

  /**
   * 规划路线
   * @param {Object} options - 路线规划选项
   * @returns {Promise<Object|null>} 路线规划结果
   */
  async calculateRoute(options = {}) {
    if (!await this.init()) {
      return null
    }

    const {
      origin, // 起点 [lng, lat] 或地址
      destination, // 终点 [lng, lat] 或地址
      mode = 'car', // 交通方式: car, bus, walk
      ...routeOptions
    } = options

    return new Promise((resolve, reject) => {
      let routePlugin
      let routeInstance

      switch (mode) {
        case 'car':
          routePlugin = 'AMap.Driving'
          break
        case 'bus':
          routePlugin = 'AMap.Transfer'
          break
        case 'walk':
          routePlugin = 'AMap.Walking'
          break
        default:
          reject(new Error('不支持的交通方式'))
          return
      }

      AMap.plugin(routePlugin, async () => {
        try {
          // 处理起点和终点，如果是地址则进行地理编码
          let originPoint = origin
          let destPoint = destination

          if (typeof origin === 'string') {
            const geoResult = await this.geocode(origin)
            if (geoResult) {
              originPoint = [geoResult.location.lng, geoResult.location.lat]
            }
          }

          if (typeof destination === 'string') {
            const geoResult = await this.geocode(destination)
            if (geoResult) {
              destPoint = [geoResult.location.lng, geoResult.location.lat]
            }
          }

          if (mode === 'car') {
            routeInstance = new AMap.Driving(routeOptions)
            routeInstance.search([
              { keyword: origin },
              { keyword: destination }
            ], (status, result) => {
              if (status === 'complete' && result.info === 'OK') {
                resolve(result)
              } else {
                reject(new Error(`路线规划失败: ${result.info}`))
              }
            })
          } else if (mode === 'walk') {
            routeInstance = new AMap.Walking(routeOptions)
            routeInstance.search([
              { keyword: origin },
              { keyword: destination }
            ], (status, result) => {
              if (status === 'complete' && result.info === 'OK') {
                resolve(result)
              } else {
                reject(new Error(`路线规划失败: ${result.info}`))
              }
            })
          } else if (mode === 'bus') {
            routeInstance = new AMap.Transfer(routeOptions)
            routeInstance.search([
              { keyword: origin },
              { keyword: destination }
            ], (status, result) => {
              if (status === 'complete' && result.info === 'OK') {
                resolve(result)
              } else {
                reject(new Error(`路线规划失败: ${result.info}`))
              }
            })
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  /**
   * 在地图上添加标记
   * @param {Object} options - 标记选项
   * @returns {AMap.Marker|null} 标记实例
   */
  addMarker(options = {}) {
    if (!this.mapInstance) {
      console.error('地图实例不存在')
      return null
    }

    const marker = new AMap.Marker({
      position: options.position || [116.397428, 39.90923],
      title: options.title || '',
      ...options
    })

    marker.setMap(this.mapInstance)
    return marker
  }

  /**
   * 获取地图实例
   * @returns {AMap.Map|null}
   */
  getMap() {
    return this.mapInstance
  }

  /**
   * 检查地图是否已加载
   * @returns {Boolean}
   */
  isLoaded() {
    return this.mapLoaded.value
  }
}

export default new MapService()