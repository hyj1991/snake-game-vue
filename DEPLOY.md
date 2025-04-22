# GitHub Pages 部署说明

本项目已配置自动部署到 GitHub Pages 的工作流。当代码推送到 `main` 分支时，GitHub Actions 将自动构建项目并部署到 GitHub Pages。

## 自动部署流程

1. 推送代码到 GitHub 仓库的 `main` 分支
2. GitHub Actions 自动触发部署工作流
3. 工作流会执行以下步骤：
   - 检出代码
   - 设置 Node.js 环境
   - 安装项目依赖
   - 构建项目
   - 将构建结果部署到 `gh-pages` 分支

## 手动触发部署

如果需要手动触发部署，可以在 GitHub 仓库页面的 Actions 标签页中手动运行工作流：

1. 进入仓库的 Actions 标签页
2. 选择 "部署到GitHub Pages" 工作流
3. 点击 "Run workflow" 按钮
4. 选择 `main` 分支并确认

## 访问已部署的网站

部署完成后，可以通过以下 URL 访问网站：

```
https://hyj1991.github.io/snake-game-vue/
```

## 注意事项

- 首次部署可能需要在仓库设置中启用 GitHub Pages，并将源设置为 `gh-pages` 分支
- 部署完成后，可能需要等待几分钟才能访问新部署的内容
- 如果遇到路径问题，请检查 `vite.config.js` 和 `package.json` 中的 `base` 配置是否正确