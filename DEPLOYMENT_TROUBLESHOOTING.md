# GitHub Pages 部署问题排查指南

## 常见问题

### 403 错误 - 没有仓库写入权限

如果在部署过程中遇到以下错误：

```
remote: Write access to repository not granted.
fatal: unable to access 'https://github.com/hyj1991/snake-game-vue.git/': The requested URL returned error: 403
```

这表明 GitHub Actions 没有足够的权限来部署到您的仓库。

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

## 验证部署

部署成功后，您应该能够通过以下链接访问您的应用：

```
https://hyj1991.github.io/snake-game-vue/
```

如果您有任何问题，请参考 [GitHub Actions 文档](https://docs.github.com/cn/actions) 或联系仓库管理员。