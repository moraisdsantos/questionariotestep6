# Quiz de Escuta Cidadã

Projeto em **Vite + React + TypeScript** para apoiar a seleção de métodos de escuta cidadã em auditorias.

## Rodar localmente

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Publicar no GitHub Pages

1. Suba o projeto para um repositório GitHub.
2. Garanta que a branch principal seja `main`.
3. Em **Settings > Pages**, selecione **GitHub Actions** como fonte de deploy.
4. Faça um push. O workflow `.github/workflows/deploy.yml` publicará o conteúdo de `dist`.

## Observações

- O `vite.config.ts` calcula automaticamente o `base` no ambiente do GitHub Actions.
- O quiz já implementa o fluxo condicional principal do algoritmo em linguagem natural.
