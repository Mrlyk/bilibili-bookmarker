let currentTab = null

// 监听 tab 更新事件，来给 bilibili 视频添加按钮(刷新时不会触发)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return
  if (tab.url && tab.url.includes('bilibili.com/video')) {
    setIcon('enable')
    // 使用视频的查询参数作为视频的唯一 ID，以让我们后面从存储中获取
    const url = new URL(tab.url)
    const pathName = url.pathname
    const videoId = pathName.split('/')[2]
    // 注意这里的打印是在扩展 -> 审查弹出内容， 或者扩展详情 -> background.js，详见调试方式

    // 通知 content-script
    chrome.tabs.sendMessage(tabId, {
      type: 'NEW', // tab 变更肯定是 ”新的“
      videoId,
    })
  } else {
    setIcon('disable')
  }
})

async function setIcon(type) {
  currentTab = await getCurrentTabURL()
  if (!currentTab) return

  const iconPath =
    type === 'enable' ? 'assets/ext-icon.png' : 'assets/ext-icon-disable.png'
  chrome.action.setIcon({
    tabId: currentTab.id,
    path: iconPath
  })
}

async function getCurrentTabURL() {
  let queryOptions = { active: true, currentWindow: true }
  let [tab] = await chrome.tabs.query(queryOptions)
  return tab
}
