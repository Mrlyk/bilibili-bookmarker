import { getCurrentTabURL } from "./utils.js";

// adding a new bookmark row to the popup
const addNewBookmark = (bookmarksElement, bookmark) => {
  const bookmarkTitleElement = document.createElement('div')
  const newBookmarkElement = document.createElement('div')
  const controlsElement = document.createElement('div')

  bookmarkTitleElement.textContent = bookmark.desc
  bookmarkTitleElement.className = 'bookmark-title'

  controlsElement.className = 'bookmark-controls'

  newBookmarkElement.id = 'bookmark-' + bookmark.time
  newBookmarkElement.className = 'bookmark'
  newBookmarkElement.setAttribute('timestamp', bookmark.time)

  // 添加跳转播放事件
  setBookmarkAttributes('play', onPlay, controlsElement)
  // 添加删除事件
  setBookmarkAttributes('delete', onDelete, controlsElement)

  newBookmarkElement.appendChild(bookmarkTitleElement)
  newBookmarkElement.appendChild(controlsElement)
  bookmarksElement.appendChild(newBookmarkElement)
};

/**
 * 展示所有已经添加的书签
 * @param { array } currentVideoBookmarks 
 */
const viewBookmarks = (currentVideoBookmarks = []) => {
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = "";
  if (currentVideoBookmarks.length > 0) {
    for(let i = 0; i < currentVideoBookmarks.length; i++) {
      const bookmark = currentVideoBookmarks[i];
      addNewBookmark(bookmarksElement, bookmark)
    }
  } else {
    bookmarksElement.innerHTML = '<i class="row">暂无书签</i>'
  }
};

const onPlay = async e => {
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute('timestamp')
  const activeTab = await getCurrentTabURL()

  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime
  })

};

const onDelete = async e => {
  const activeTab = await getCurrentTabURL()
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute('timestamp')
  const bookmarkElementToDelete = document.getElementById('bookmark-' + bookmarkTime)

  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete)

  chrome.tabs.sendMessage(activeTab.id, {
    type: "DELETE",
    value: bookmarkTime
  }, viewBookmarks)

};

/**
 * 给书签控制栏添加属性的统一方式
 * @param {string} src 控制图标的文件名
 * @param {function} eventListener 控制事件
 * @param {HTMLElement} controlParentElement 控制栏的父元素
 */
const setBookmarkAttributes =  (src, eventListener, controlParentElement) => {
  const controlElement = document.createElement('img')

  controlElement.src = `assets/${src}.png`
  controlElement.title = src
  controlElement.onclick = eventListener
  controlParentElement.appendChild(controlElement)
};

// 这里是 popup 的 DOMContentLoader 事件，每次 popup 弹出都会触发
document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getCurrentTabURL()
  const url = new URL(activeTab.url)
  const pathName = url.pathname

  const currentVideo = pathName.split("/")[2]
  if (activeTab.url.includes("bilibili.com/video") && currentVideo) {
    chrome.storage.sync.get([currentVideo], data => {
      const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : []
      viewBookmarks(currentVideoBookmarks)
    })
  } else {
    const popupContainer = document.getElementsByClassName('container')[0]
    popupContainer.innerHTML = '<div class="title">bilibili 视频标签</div>'
  }
});