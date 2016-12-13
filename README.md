# webapp-simple-example  
一个基于babel转换器和自己实现的库的简单webapp例子。

# 分析
&nbsp;&nbsp;&nbsp;&nbsp;基于组件化开发的思想构建应用，页面由组件构成，每个组件都是独立且功能完整可交互的区域。  
每个应用包括多种组件，每个组件的功能和交互都可不同，所以先将组件根据结构、功能、交互进行分类。  

# 拆分规则
* 从结构进行划分；  
* 从功能进行划分；  
* 从交互上进行划分；  

# 组件划分
应用可分为：  
`引导页` `主页` `动态页` `好友页` `我的页`  
`动效列表页` `动效详情页` `左侧栏`  
`设置页` `信息编辑页` `文章列表页` `搜索页`

**引导页面：**  
  `结构`：Logo Component  
**主页：**  
  `结构`：AppBar Component、NavigationBar Component、Main Component  
  AppBar Component  
  `结构`：NavigationMenu Component、NavigationCheronRightMenu Component
  NavigationBar Component  
  `结构`：NavigationIconBar  
**动态页：**   

**动效列表页：**  
  `结构`：DynamicListItem Component

http://ghmagical.com/app
# 目录结构
