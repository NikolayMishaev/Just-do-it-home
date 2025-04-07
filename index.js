'use strict'

const body = document.querySelector('.body')
const containerBtnsThemes = document.querySelector('.task-manager__theme')
const inputTask = document.querySelector('.task-manager__input')
const inputTaskDate = document.querySelector('.task-manager__input-date')
const buttonTaskAdd = document.querySelector('.task-manager__button_task_add')
const containerTasks = document.querySelector('.task-manager__container-tasks')
const templateTask = document.querySelector('.template-task')
const dateLastTask = document.querySelector('.task-manager__date')
const paginationPanel = document.querySelector('.task-manager__pagination-panel')
const buttonPrevPagination = document.querySelector('.task-manager__button_pagination_prev')
const buttonNextPagination = document.querySelector('.task-manager__button_pagination_next')
const page = document.querySelector('.task-manager__page')
const taskmanager = document.querySelector('.task-manager')
const inputPage = document.querySelector('.task-manager__input-page')
const dateTip = document.querySelector('.task-manager__date-tip')
const select = document.querySelector('.task-manager__select')

let arrayTasks = []
let currentPage = 0
let countTasksOnPage = 4
let currentId = 1

const addClasses = (element, ...className) => element.classList.add(...className)

const removeClasses = (element, ...className) => {
    if (className.length === 0) element.className = ""
    else element.classList.remove(...className)
}

const getTheme = (event) => {
    const theme = event.target.className.split('_').at(-1)
    if (theme === body.className.split('_').at(-1)) return  // если текущая тема та же, что и была, тогда тему не менять
    const possibleThemes = ['grey', 'white', 'black']
    if (possibleThemes.includes(theme)) return theme
}

const setTheme = (theme) => {
    switch (theme) {
        case'grey': {
            removeClasses(body)
            addClasses(body, 'body', 'body_theme_grey')
            break
        }
        case'white': {
            removeClasses(body)
            addClasses(body, 'body', 'body_theme_white')
            break
        }
        case'black': {
            removeClasses(body)
            addClasses(body, 'body', 'body_theme_black')
            break
        }
        default: {
            removeClasses(body)
            body.classList.add('body', 'body_theme_grey')
        }
    }
}

const getMaxCountPage = () => Math.ceil(arrayTasks.length / countTasksOnPage)

const setEventListener = (element, action) => element.addEventListener('click', action)

const saveToLocalStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const checkTaskComplete = (event) => {
    if (!event.target.className.endsWith('button_task_complete')) return
    const idCurrentTask = +event.target.closest('.task-manager__task').getAttribute('id')
    arrayTasks = arrayTasks.map(task => {
        if (task.id === idCurrentTask) task.isComplete = !task.isComplete
        return task
    })
    saveToLocalStorage('arrayTasks', arrayTasks)
    sliceTasks()
}

const deleteTask = (event) => {
    if (!event.target.className.endsWith('button_task_delete')) return
    const currentTask = event.target.closest('.task-manager__task')
    const idCurrentTask = +currentTask.getAttribute('id')
    arrayTasks = arrayTasks.filter(task => task.id !== idCurrentTask)
    saveToLocalStorage('arrayTasks', arrayTasks)
    updateDate()
    viewTasks()
}

const selectTask = (event) => {
    if (event.target.className.includes('button')) return
    const currentTask = event.target.closest('li')
    if (currentTask && currentTask.className.endsWith('border-red')) {
        removeClasses(currentTask,'border-red')
        updateDate()
        return
    }
    if (currentTask) {
        Array.from(containerTasks.children).forEach(e=>removeClasses(e,'border-red'))
        addClasses(currentTask, 'border-red')
        updateDate(arrayTasks.find(task => task.date === currentTask.getAttribute('data-date')))
    }
}

const updateDate = (task) => {
    if (arrayTasks.length > 0) {
        if (select.value === 'дата выполнения') {
            dateLastTask.textContent = task ? task. dateCompletion : sortBySelect(arrayTasks)[0].dateCompletion
        } else dateLastTask.textContent = task ? task.date : arrayTasks.at(-1).date
    }
    else dateLastTask.textContent = `You don't have a single task.`
}

const formatDate = (num) =>  String(num).length === 1 ? `0${String(num)}` : String(num)

const getDate = (date) => {
    if (!date) date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()
    const formatedDate = `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${hours > 12 ? 'PM' : 'AM'}`
    return {currentDate: formatedDate, dateInSeconds: date, date: `${year}-${formatDate(month)}-${formatDate(day)}` }
}

const createTask = (dataTask) => {
    const {text, isComplete, id, date} = dataTask
    const task = (templateTask.content.cloneNode(true))
    task.querySelector('.task-manager__task-text').textContent = text
    task.querySelector('.task-manager__task').setAttribute("id", id)
    task.querySelector('.task-manager__task').setAttribute("data-date",date )
    if (isComplete) task.querySelector('.task-manager__task').classList.add('task-manager__task_complete')
    containerTasks.append(task)
}

const sortBySelect = (tasks) => {
    if (select.value === 'дата выполнения') {
        return tasks.toSorted((a, b) => new Date(a.dateCompletion) - new Date(b.dateCompletion))
    }else return tasks.toSorted((a, b) => b.id - a.id)
}

const setCountPage = () => {
    if (arrayTasks.length < countTasksOnPage) {
        currentPage = 0
        return
    }
    const maxCountPage = getMaxCountPage()
    if (currentPage + 1 > maxCountPage) currentPage = maxCountPage - 1
}

const viewTasks = () => {
    if (arrayTasks.length <= countTasksOnPage) {
        hidePaginationPanel()
    } else showPaginationPanel()
    setCountPage()
    sliceTasks()
    updateDate()
}

const clearContainerTasks = () => containerTasks.textContent = ''

const viewPage = () => {
    const maxCountPage = getMaxCountPage()
    if (maxCountPage === 1) {
        page.textContent = currentPage + 1
    } else {
        page.textContent = `${currentPage + 1} / ${maxCountPage}`
    }
}

const sliceTasks = () => {
    clearContainerTasks()
    viewPage()
    const currentSlice = currentPage * countTasksOnPage
    sortBySelect(arrayTasks).slice(currentSlice, currentSlice + countTasksOnPage).map(task => createTask(task))
}

const showPaginationPanel = () => paginationPanel.classList.remove('display-none')

const hidePaginationPanel = () => paginationPanel.classList.add('display-none')

const loadDataFromLocalStorage = () => {
    const tasks = localStorage.getItem("arrayTasks")
    if (tasks) arrayTasks.push(...JSON.parse(tasks))
    const theme = localStorage.getItem('theme')
    if (theme) setTheme(JSON.parse(theme))
    const page = +localStorage.getItem('page')
    if (page) currentPage = page
    const id = +localStorage.getItem('id')
    if (id) currentId = id
    const countTasks = +localStorage.getItem('countTasksOnPage')
    if (countTasks) countTasksOnPage = countTasks
}

containerBtnsThemes.addEventListener('click', event => {
    const theme = getTheme(event)
    if (theme) setTheme(theme)
    saveToLocalStorage('theme', theme)
})

buttonTaskAdd.addEventListener('click', (event => {
    const taskText = inputTask.value.replaceAll(' ','\u00A0')
    const dateCompletion = inputTaskDate.value
    if (!taskText) return
    const {currentDate, dateInSeconds} = getDate()
    arrayTasks.push({text: taskText, date: currentDate, dateInSeconds: dateInSeconds, dateCompletion, isComplete: false, id: currentId})
    ++currentId
    saveToLocalStorage('arrayTasks', arrayTasks)
    saveToLocalStorage('id', currentId)
    viewTasks()
    inputTask.value = ''
    addClasses(inputTaskDate, 'visibility-none')
    addClasses(dateTip, 'visibility-none')
    setTimeout(()=>inputTaskDate.value = getDate().date,500)
}))

buttonPrevPagination.addEventListener('click', ()=> {
    if (currentPage === 0) return
    --currentPage
    saveToLocalStorage('page', currentPage)
    sliceTasks()
})

buttonNextPagination.addEventListener('click', ()=> {
    if (currentPage + 1 === getMaxCountPage()) return
    ++currentPage
    saveToLocalStorage('page', currentPage)
    sliceTasks()
})

page.addEventListener('click',() => {
    addClasses(page, 'display-none')
    removeClasses(inputPage, 'display-none')
})

inputPage.addEventListener('change', (e) => {
    const newCountTaskOnPage = Number(e.target.value)
    if (typeof newCountTaskOnPage === 'number' && newCountTaskOnPage > 0 && newCountTaskOnPage < 21) {
        countTasksOnPage = newCountTaskOnPage
        saveToLocalStorage('countTasksOnPage', countTasksOnPage)
    }
    addClasses(inputPage, 'display-none')
    removeClasses(page, 'display-none')
    viewTasks()
})

inputTask.addEventListener('input', () => {
    if (inputTaskDate.className.includes('visibility-none')) {
        removeClasses(inputTaskDate, 'visibility-none')
        removeClasses(dateTip, 'visibility-none')
    }
    if (inputTask.value === '') {
        addClasses(inputTaskDate, 'visibility-none')
        addClasses(dateTip, 'visibility-none')
    }
})

select.addEventListener('change', (e) => {
    viewTasks()
})

loadDataFromLocalStorage()
viewTasks()
setEventListener(containerTasks, checkTaskComplete)
setEventListener(containerTasks, deleteTask)
setEventListener(containerTasks, selectTask)

inputTaskDate.value = getDate().date
