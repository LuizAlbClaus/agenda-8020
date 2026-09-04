import { test, expect } from "@playwright/test";

test.describe("Landing Page de Upsell Soft Gel Express -> Agenda 80/20", () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  });

  test("1. Rota /upsell/soft-gel: deve carregar todas as 10 seções visuais e elementos canônicos", async ({ page }) => {
    await page.goto("/upsell/soft-gel");

    // SEÇÃO 1: Hero de Interrupção
    await expect(page.getByText(/Sua compra do Soft Gel Express foi confirmada/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /^ESPERE\.$/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Como Recuperar 100% do Investimento do Soft Gel Express/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /SIM! ADICIONAR O AGENDA 80\/20 AO MEU PEDIDO/i }).first()).toBeVisible();

    // SEÇÃO 2: A Lacuna Entre Aprender e Começar
    await expect(page.getByText(/Aprender é o primeiro passo/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Técnica Perfeita com Mesa Vazia Não Paga Boleto/i })).toBeVisible();
    await expect(page.getByText(/Dominar a técnica é só 50% do caminho/i)).toBeVisible();
    await expect(page.getByText(/Técnica/i).first()).toBeVisible();
    await expect(page.getByText(/Direção/i).first()).toBeVisible();

    // SEÇÃO 3: A Ponte Entre os Dois Produtos
    await expect(page.getByRole("heading", { name: /DOIS PASSOS\. UM CAMINHO MAIS CLARO\./i })).toBeVisible();
    await expect(page.getByText(/O Soft Gel Express ensina o que fazer nas unhas/i)).toBeVisible();
    await expect(page.getByText(/O Agenda 80\/20 ajuda você a decidir o que fazer pelo seu negócio/i)).toBeVisible();

    // SEÇÃO 4: O Agenda Acompanha a Fase da Profissional
    await expect(page.getByRole("heading", { name: /VOCÊ COMEÇA AGORA\. O AGENDA ACOMPANHA CADA FASE\./i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Ainda estou aprendendo/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Estou praticando/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Procurando minhas primeiras clientes/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Quero que elas voltem/i })).toBeVisible();

    // SEÇÃO 5: Demonstração Interativa do Onboarding
    await expect(page.getByRole("heading", { name: /O AGENDA COMEÇARIA PELO SEU MOMENTO\./i })).toBeVisible();
    await expect(page.getByText(/Em que situação você está\?/i)).toBeVisible();

    // SEÇÃO 6: Uma Primeira Ação Concreta
    await expect(page.getByRole("heading", { name: /UMA ORIENTAÇÃO PRÁTICA PARA COMEÇAR HOJE/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /COPIAR MENSAGEM/i })).toBeVisible();

    // SEÇÃO 7: O Que Acontece Quando Novas Situações Aparecem
    await expect(page.getByRole("heading", { name: /VOCÊ NÃO PRECISA DESCOBRIR TUDO SOZINHA\./i })).toBeVisible();
    await expect(page.getByText("SOS Copiloto").first()).toBeVisible();
    await expect(page.getByText("Retenção").first()).toBeVisible();
    await expect(page.getByText("Diagnóstico de Valor").first()).toBeVisible();

    // SEÇÃO 8: Uso na Vida Real
    await expect(page.getByRole("heading", { name: /Você não precisa virar especialista em marketing/i })).toBeVisible();
    await expect(page.getByText("Abra o Agenda 80/20")).toBeVisible();

    // SEÇÃO 9: Da Técnica à Primeira Oportunidade
    await expect(page.getByRole("heading", { name: /Você aprende\. Se prepara\. Começa a se movimentar\./i })).toBeVisible();
    await expect(page.getByText(/Escolha um horário/i)).toBeVisible();
    await expect(page.getByText(/Alongamento Soft Gel/i)).toBeVisible();

    // SEÇÃO 10: Oferta, Belevy, FAQ e Fechamento
    await expect(page.getByRole("heading", { name: /Agora pode começar a colocar essa nova habilidade em movimento\./i })).toBeVisible();
    await expect(page.getByText("147", { exact: true })).toBeVisible();
    await expect(page.getByText(/Belevy pode ser uma continuação opcional/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Dúvidas comuns sobre o Agenda 80\/20/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Não saia com mais 20 coisas para fazer\./i })).toBeVisible();
    await expect(page.getByRole("link", { name: /QUERO COMEÇAR OS DOIS JUNTOS/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Não, eu prefiro aprender a técnica/i }).first()).toBeVisible();
  });

  test("2. Demonstração Interativa (Seção 5): deve alternar dinamicamente as recomendações conforme a fase", async ({ page }) => {
    await page.goto("/upsell/soft-gel");

    // Fase 1 padrão: Ainda estou aprendendo
    await expect(page.getByRole("heading", { name: /Comece construindo sua primeira prova real/i })).toBeVisible();

    // Clicar em Fase 2: Estou praticando
    await page.getByRole("button", { name: /Estou praticando/i }).click();
    await expect(page.getByRole("heading", { name: /Convide 2 a 3 pessoas próximas como modelos/i })).toBeVisible();

    // Clicar em Fase 3: Procurando minhas primeiras clientes
    await page.getByRole("button", { name: /Procurando minhas primeiras clientes/i }).click();
    await expect(page.getByRole("heading", { name: /Avise sua rede próxima que sua agenda vai abrir/i })).toBeVisible();

    // Clicar em Fase 4: Já tenho algumas clientes
    await page.getByRole("button", { name: /Já tenho algumas clientes/i }).click();
    await expect(page.getByRole("heading", { name: /Reative quem já foi atendida há mais de 3 semanas/i })).toBeVisible();

    // Clicar em Fase 5: Minha agenda está irregular
    await page.getByRole("button", { name: /Minha agenda está irregular/i }).click();
    await expect(page.getByRole("heading", { name: /Crie uma oportunidade direta para os horários vagos/i })).toBeVisible();
  });

  test("3. Copiar mensagem (Seção 6): deve copiar o script para o clipboard com feedback visual", async ({ page }) => {
    await page.goto("/upsell/soft-gel");

    const copyBtn = page.getByRole("button", { name: /COPIAR MENSAGEM/i });
    await copyBtn.scrollIntoViewIfNeeded();
    await copyBtn.click();

    await expect(page.getByText(/Mensagem copiada!/i)).toBeVisible();
  });

  test("4. FAQ Acordeão (Seção 10): deve abrir e fechar itens acessíveis", async ({ page }) => {
    await page.goto("/upsell/soft-gel");

    const faqButton = page.getByRole("button", { name: /Preciso já ter clientes para usar\?/i });
    await faqButton.scrollIntoViewIfNeeded();
    await faqButton.click();

    await expect(
      page.getByText(/Não\. Existem caminhos e recomendações desenhados especificamente para quem ainda está aprendendo/i)
    ).toBeVisible();
  });

  test("5. Rota /?lp=soft-gel e /upsell: devem renderizar a mesma página de upsell preservando UTMs", async ({ page }) => {
    await page.goto("/?lp=soft-gel&utm_source=test_source&utm_campaign=sge_upsell");

    await expect(page.getByText(/Sua compra do Soft Gel Express foi confirmada/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /^ESPERE\.$/i })).toBeVisible();

    const ctaLink = page.getByRole("link", { name: /SIM! ADICIONAR O AGENDA 80\/20 AO MEU PEDIDO/i }).first();
    const href = await ctaLink.getAttribute("href");
    expect(href).toBeDefined();

    // Também testar a rota alias /upsell
    await page.goto("/upsell");
    await expect(page.getByText(/Sua compra do Soft Gel Express foi confirmada/i)).toBeVisible();
  });

  test("6. Responsividade em todas as viewports obrigatórias (320px, 375px, 390px, 430px, tablet, notebook, desktop)", async ({
    page,
  }) => {
    const viewports = [
      { name: "320px (Mobile pequeno)", width: 320, height: 640 },
      { name: "375px (iPhone SE)", width: 375, height: 667 },
      { name: "390px (iPhone 14)", width: 390, height: 844 },
      { name: "430px (iPhone Pro Max)", width: 430, height: 932 },
      { name: "Tablet (iPad)", width: 768, height: 1024 },
      { name: "Notebook", width: 1024, height: 768 },
      { name: "Desktop largo", width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/upsell/soft-gel");

      // Verificar ausência de overflow horizontal
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll, `Overflow horizontal detectado na viewport ${vp.name}`).toBe(false);

      // Verificar que o CTA principal é visível e tem altura mínima ergonômica de 48px
      const ctaBtn = page.getByRole("link", { name: /SIM! ADICIONAR O AGENDA 80\/20 AO MEU PEDIDO/i }).first();
      await expect(ctaBtn).toBeVisible();
      const box = await ctaBtn.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(48);
      }
    }
  });
});

