# GitHub Pages 部署问题排查指南

## 常见问题

### 403 错误 - 没有仓库写入权限

如果在部署过程中遇到以下错误：

```
remote: Write access to repository not granted.
fatal: unable to access 'https://github.com/hyj1991/snake-game-vue.git/': The requested URL returned error: 403
```

这表明 GitHub Actions 没有足够的权限来部署到您的仓库。

### 404 错误 - 网站无法访问

如果您在访问 `https://hyj1991.github.io/snake-game-vue/` 时看到404错误页面，可能有以下原因：

1. **GitHub Pages 设置未正确配置**：即使gh-pages分支存在并包含正确的文件，如果GitHub Pages设置未正确配置，网站仍然无法访问。

2. **部署尚未完成**：GitHub Pages部署可能需要几分钟时间才能生效。

3. **路径配置问题**：如果vite.config.js中的base路径配置不正确，可能导致资源路径错误。

## 已实施的解决方案

我们已经在 GitHub Actions 工作流配置中添加了以下更改：

1. 添加了 `permissions` 配置，明确授予工作流对仓库内容的写入权限：

```yaml
permissions:
  contents: write
```

2. 在部署步骤中明确指定使用 `GITHUB_TOKEN`：

```yaml
- name: 部署到GitHub Pages
  uses: JamesIves/github-pages-deploy-action@v4
  with:
    folder: dist
    branch: gh-pages
    token: ${{ secrets.GITHUB_TOKEN }}
```

## 解决404错误的方法

如果您遇到404错误，请按照以下步骤检查和修复：

1. **检查GitHub Pages设置**：
   - 进入仓库设置（Settings）
   - 在左侧菜单中点击'Pages'
   - 在'Build and deployment'部分，确保：
     - Source设置为'Deploy from a branch'
     - Branch设置为'gh-pages'，文件夹设置为'/ (root)'
   - 点击Save保存设置

2. **验证gh-pages分支内容**：
   - 确认gh-pages分支存在
   - 确认分支中包含index.html和必要的资源文件
   - 确认资源路径正确（应以/snake-game-vue/开头）

3. **检查vite.config.js配置**：
   - 确认base路径设置正确：`base: process.env.NODE_ENV === 'production' ? '/snake-game-vue/' : '/'`

4. **等待部署完成**：
   - GitHub Pages部署可能需要几分钟时间才能生效
   - 检查仓库的Actions标签页，确认部署工作流已成功完成

## 其他可能的解决方案

如果上述更改仍然无法解决问题，您可以尝试以下方法：

1. **创建个人访问令牌 (PAT)**：
   - 在 GitHub 设置中创建一个具有 `repo` 权限的个人访问令牌
   - 在仓库的 Secrets 中添加这个令牌（例如命名为 `PAT`）
   - 在工作流中使用这个令牌：`token: ${{ secrets.PAT }}`

2. **检查仓库设置**：
   - 确保 GitHub Actions 在仓库设置中已启用
   - 检查分支保护规则是否阻止了 GitHub Actions 的推送

3. **检查组织设置**：
   - 如果仓库属于组织，确保组织的 GitHub Actions 策略允许此工作流运行

4. **手动触发部署**：
   - 在GitHub仓库页面的Actions标签页中手动运行'部署到GitHub Pages'工作流

## 验证部署

部署成功后，您应该能够通过以下链接访问您的应用：

```
https://hyj1991.github.io/snake-game-vue/
```

如果您有任何问题，请参考 [GitHub Actions 文档](https://docs.github.com/cn/actions) 或 [GitHub Pages 文档](https://docs.github.com/cn/pages)，或联系仓库管理员。