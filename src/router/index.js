import Vue from 'vue'
import VueRouter from 'vue-router'
// 路由懒加载
// const Foo = () => import(/* webpackChunkName: "group-foo" */ './Foo.vue')
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Login')
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Home')
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Welcome')
// import Login from '../components/Login'
// import Home from '../components/Home'
// import Welcome from '../components/Welcome'

const Users = () => import(/* webpackChunkName: "Users_Right_Roles" */ '../components/User/Users')
const Rights = () => import(/* webpackChunkName: "Users_Right_Roles" */ '../components/Power/Rights')
const Roles = () => import(/* webpackChunkName: "Users_Right_Roles" */ '../components/Power/Roles')
// import Users from '../components/User/Users'
// import Rights from '../components/Power/Rights'
// import Roles from '../components/Power/Roles'

const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/Goods/Cate')
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/Goods/Params')
// import Cate from '../components/Goods/Cate'
// import Params from '../components/Goods/Params'

const Goods = () => import(/* webpackChunkName: "Goods_Add" */ '../components/Goods/Goods')
const Add = () => import(/* webpackChunkName: "Goods_Add" */ '../components/Goods/Add')
// import Goods from '../components/Goods/Goods'
// import Add from '../components/Goods/Add'

const Order = () => import(/* webpackChunkName: "Order" */ '../components/Order/Order')
// import Order from '../components/Order/Order'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome,
        children: [
          { path: '/users', component: Users },
          { path: '/rights', component: Rights },
          { path: '/roles', component: Roles },
          { path: '/categories', component: Cate },
          { path: '/params', component: Params },
          { path: '/goods', component: Goods },
          { path: '/goods/add', component: Add },
          { path: '/orders', component: Order }
        ]
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  if (!window.sessionStorage.getItem('token')) {
    return next('/login')
  }
  next()
})

export default router
