// 导出所有状态
import {useUserStore} from './user'
import {useAddressStore} from './address'
import {useCategoryStore} from './category'
import {useAdminOrderStore} from './adminOrder'
import {useAdminProductStore} from './adminProduct'
import {useStatisticsStore} from './statistics'
import {useAdminUserStore} from './adminUser'
import {useAdminCategoryStore} from './adminCategory'
import {useCommentStore} from './comment'
import {useFavoriteStore} from './favorite'
import {useMessageStore} from './message'
import {useOrderStore} from './order'
import {useProductStore} from './product'
import {useRecommendationStore} from './recommendation'
import {useNotificationStore} from './notification'
import {useFileStore} from './file'

export {
    useUserStore,
    useAddressStore,
    useCategoryStore,
    useAdminOrderStore,
    useAdminProductStore,
    useStatisticsStore,
    useAdminUserStore,
    useAdminCategoryStore,
    useCommentStore,
    useFavoriteStore,
    useMessageStore,
    useOrderStore,
    useProductStore,
    useRecommendationStore,
    useNotificationStore,
    useFileStore
}

// 初始化函数，用于应用启动时预加载某些状态
export function initializeStores() {
    // 在这里可以初始化需要预加载的store
    const userStore = useUserStore()

    // 返回初始化的stores，方便调试
    return {
        userStore
    }
} 