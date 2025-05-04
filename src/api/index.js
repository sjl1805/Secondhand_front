// 导出所有API
import * as authApi from './auth'
import * as userApi from './user'
import * as addressApi from './address'
import * as categoryApi from './category'
import * as orderApi from './order'
import * as productApi from './product'
import * as statisticsApi from './statistics'
import * as adminUserApi from './adminUser'
import * as commentApi from './comment'
import * as favoriteApi from './favorite'
import * as messageApi from './message'
import * as adminOrderApi from './adminOrder'
import * as adminProductApi from './adminProduct'
import * as recommendationApi from './recommendation'
import * as notificationApi from './notification'
import * as adminNotificationApi from './adminNotification'
import * as fileApi from './file'

// 导出所有API

export {
    authApi,
    userApi,
    addressApi,
    categoryApi,
    orderApi,
    productApi,
    statisticsApi,
    adminUserApi,
    commentApi,
    favoriteApi,
    messageApi,
    adminOrderApi,
    adminProductApi,
    recommendationApi,
    notificationApi,
    adminNotificationApi,
    fileApi
}

// 按需添加其他模块的API
// import * as productApi from './product'
// export { productApi } 