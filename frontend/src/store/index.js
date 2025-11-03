import { createPinia } from 'pinia'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))

  const isAuthenticated = computed(() => {
    return !!token.value
  })

  function setUser(userData) {
    user.value = userData
  }

  function setToken(tokenData) {
    token.value = tokenData
    localStorage.setItem('token', tokenData)
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    setToken,
    logout
  }
})

export const useTripStore = defineStore('trips', () => {
  const trips = ref([])
  const currentTrip = ref(null)

  function addTrip(trip) {
    trips.value.push(trip)
  }

  function setTrips(tripsData) {
    trips.value = tripsData
  }

  function setCurrentTrip(trip) {
    currentTrip.value = trip
  }

  function updateTrip(updatedTrip) {
    const index = trips.value.findIndex(t => t._id === updatedTrip._id)
    if (index !== -1) {
      trips.value[index] = updatedTrip
    }
    if (currentTrip.value && currentTrip.value._id === updatedTrip._id) {
      currentTrip.value = updatedTrip
    }
  }

  function deleteTrip(tripId) {
    trips.value = trips.value.filter(t => t._id !== tripId)
    if (currentTrip.value && currentTrip.value._id === tripId) {
      currentTrip.value = null
    }
  }

  return {
    trips,
    currentTrip,
    addTrip,
    setTrips,
    setCurrentTrip,
    updateTrip,
    deleteTrip
  }
})

export const useBudgetStore = defineStore('budget', () => {
  const expenses = ref([])
  const budget = ref(null)

  function setExpenses(expensesData) {
    expenses.value = expensesData
  }

  function addExpense(expense) {
    expenses.value.push(expense)
  }

  function updateExpense(updatedExpense) {
    const index = expenses.value.findIndex(e => e._id === updatedExpense._id)
    if (index !== -1) {
      expenses.value[index] = updatedExpense
    }
  }

  function deleteExpense(expenseId) {
    expenses.value = expenses.value.filter(e => e._id !== expenseId)
  }

  function setBudget(budgetData) {
    budget.value = budgetData
  }

  const totalExpenses = computed(() => {
    return expenses.value.reduce((sum, expense) => sum + expense.amount, 0)
  })

  const remainingBudget = computed(() => {
    return budget.value ? budget.value - totalExpenses.value : 0
  })

  return {
    expenses,
    budget,
    setExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    setBudget,
    totalExpenses,
    remainingBudget
  }
})

export default createPinia()