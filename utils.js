/**
 * 获取当前激活的标签页
 * @returns {Promise<Tab>}
 */
export async function getCurrentTabURL() {
  let queryOptions = { active: true, currentWindow: true }
  let [tab] = await chrome.tabs.query(queryOptions)
  return tab
}
