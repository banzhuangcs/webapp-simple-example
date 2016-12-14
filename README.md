# webapp-simple-example  
一个基于babel转换器和自己实现的库的简单webapp例子。

# 分析
&nbsp;&nbsp;&nbsp;&nbsp;基于组件化开发的思想构建应用，页面由组件构成，每个组件都是独立且功能完整可交互的区域。  
每个应用包括多种组件，每个组件的功能和交互都可不同，所以先将组件根据结构、功能、交互进行分类。  

# 拆分规则
* 从结构进行划分，相同的元素结构出现多次，如`listitem`
* 从功能进行划分，独立只完成某件事情，如`显示数据`
* 从交互上进行划分，只做前端效果，如`轮播图`  

# 组件划分
应用可分为：  
`引导页` `主页` `动态页` `好友页` `个人主页`  
`动效列表页` `动效详情页` `左侧栏页`  
`设置页` `信息编辑页` `文章列表页` `搜索页`

**引导页面：**  
  `结构`：Logo Component  
**主页：**  
  `结构`：AppBar Component、NavigationBar Component、Main Component  
  AppBar Component  
  `结构`：NavigationMenu Component、NavigationCheronRightMenu Component  
  NavigationBar Component  
  `结构`：NavigationIconBar Component  
**动态页：**  
  `结构`：DynamicListItem Component  
  DynamicListItem Component  
  `结构`：InfoDetail Component、InfoContent Component、InfoAttr Component、InfoComment Component  
**好友页：**  
  `结构`：FriendListItem Component  
  InfoDetail Component  
**个人主页：**  
  `结构`：InfoDetail Component、Configuration Component  

**效果列表页：**  
  `结构`：EffectList Component  
  EffectList Component  
  `结构`:  List Component

**左侧栏页：**  
  `结构`: UserDetail Component、FunctionalList Component  
  FunctionalList Component  
  `结构`: FunctionalListItem Component  
**设置页：**  
  `结构`: AppBar Component、Banner Component、UserDetail Component、FollowButton Component、Tab Component  
  AppBar Component
  `结构`: Back Component、EditButton Component  
  Tab Component  
  `结构`: SwitchToAnimate Component、TabHeader Component、TabMain Component  
  TabMain Component  
  `结构`: ArticleList Component  
  ArticleList Component    
  `结构`: List Component  
**信息编辑页：**
  `结构`：AppBar Component、InfoList Component、SlideToAnimate Component、Calc Component

http://ghmagical.com/app
# 目录结构
