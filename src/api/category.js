import request from '@/utils/request'

/**
 * 添加分类
 * @param {Object} data - 分类信息
 * @param {string} data.name - 分类名称
 * @param {number} data.parentId - 父分类ID
 * @param {number} data.sort - 排序值
 * @param {string} data.icon - 分类图标
 * @returns {Promise}
 */
export function addCategory(data) {
  return request({
    url: '/admin/category/add',
    method: 'post',
    data
  })
}

/**
 * 更新分类
 * @param {Object} data - 分类信息
 * @param {number} data.id - 分类ID
 * @param {string} data.name - 分类名称
 * @param {number} data.parentId - 父分类ID
 * @param {number} data.sort - 排序值
 * @param {string} data.icon - 分类图标
 * @returns {Promise}
 */
export function updateCategory(data) {
  return request({
    url: '/admin/category/update',
    method: 'put',
    data
  })
}

/**
 * 删除分类
 * @param {number} id - 分类ID
 * @returns {Promise}
 */
export function deleteCategory(id) {
  return request({
    url: `/admin/category/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 检查分类名称是否存在
 * @param {string} name - 分类名称
 * @param {number} parentId - 父分类ID
 * @param {number} excludeId - 排除的分类ID（用于更新时排除自身）
 * @returns {Promise}
 */
export function checkCategoryNameExists(name, parentId = 0, excludeId) {
  return request({
    url: '/admin/category/check',
    method: 'get',
    params: {
      name,
      parentId,
      excludeId
    }
  })
}

/**
 * 获取分类列表
 * @returns {Promise}
 */
export function getAllCategories() {
  return request({
    url: '/category/list',
    method: 'get'
  })
}

/**
 * 获取分类详情
 * @param {number} categoryId - 分类ID
 * @returns {Promise}
 */
export function getCategoryDetail(categoryId) {
  return request({
    url: `/category/${categoryId}`,
    method: 'get'
  })
}

/**
 * 获取子分类
 * @param {number} parentId - 父分类ID
 * @returns {Promise}
 */
export function getSubCategories(parentId) {
  return request({
    url: `/category/sub/${parentId}`,
    method: 'get'
  })
}

/**
 * 获取分类树
 * @returns {Promise}
 */
export function getCategoryTree() {
  return request({
    url: '/category/tree',
    method: 'get'
  })
} 