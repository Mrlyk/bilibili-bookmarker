// 加载完成后立即执行
;(() => {
  let bilibiliLeftControls, bilibiliPlayer
  let currentVideo = ''
  let currentVideoBookmarks = []

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj
    // 开启新标签页的时候
    if (type === 'NEW') {
      currentVideo = videoId
      newVideoLoaded()
    } else if (type === 'PLAY') {
      bilibiliPlayer.currentTime = value
    } else if (type === 'DELETE') {
      currentVideoBookmarks = currentVideoBookmarks.filter(
        (bookmark) => bookmark.time !== +value
      )
      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify(currentVideoBookmarks),
      })
      response(currentVideoBookmarks)
    }
  })

  const newVideoLoaded = async () => {
    currentVideoBookmarks = await fetchBookmarks()
    // 检查是否存在
    const bookmarkBtnExists = document.getElementsByClassName('bookmark-btn')[0]
    if (bookmarkBtnExists) return
    const bookmarkBtn = document.createElement('img')
    // 获取 web_accessible 声明的可访问的资源文件
    bookmarkBtn.src = chrome.runtime.getURL('assets/bookmark.png')
    bookmarkBtn.className = 'ytp-button bookmark-btn'
    bookmarkBtn.title = '点击添加当前时间戳到插件书签'

    bilibiliLeftControls = document.getElementsByClassName(
      'bilibili-player-video-control-bottom-left'
    )[0]
    bilibiliPlayer = document.getElementsByTagName('video')[0]

    bookmarkBtn.onclick = addNewBookmarkEventHandler
    appendChildByObserver(bilibiliLeftControls, bookmarkBtn)
  }

  const addNewBookmarkEventHandler = async (event) => {
    if (!bilibiliPlayer) return
    const currentTime = bilibiliPlayer.currentTime
    const newBookmark = {
      time: currentTime,
      desc: getTime(currentTime) + ' 从这里开始看',
    }
    currentVideoBookmarks = await fetchBookmarks()

    // 存储到 chrome storage，合并原来的和新增的
    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify(
        [...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time)
      ),
    })
    currentVideoBookmarks = [...currentVideoBookmarks, newBookmark]
    informSuccess()
  }

  /**
   * 获取当前视频上已经存在的书签
   * @returns {Promise<void>}
   */
  const fetchBookmarks = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : [])
      })
    })
  }
})()

/** 秒数 -> 时间 */
const getTime = (time) => {
  const date = new Date(0)
  date.setSeconds(time)
  return date.toISOString().substr(11, 8)
}

const informSuccess = () => {
  const success = document.createElement('div')
  success.className = 'ytb-success'
  success.innerText = '书签添加成功'
  document.body.appendChild(success)
  setTimeout(() => {
    success.remove()
  }, 2000)
}

/**
 * 观测子元素变化来动态添加元素（即加载完成后再添加元素）
 * @param {HTMLElement} parent
 * @param {HTMLElement} child
 */
function appendChildByObserver(parent, child) {
  const observer = new MutationObserver(() => {
    if (parent.contains(child)) {
      observer.disconnect()
    } else {
      parent.appendChild(child)
    }
  })
  observer.observe(parent, { childList: true, subtree: true })
}
