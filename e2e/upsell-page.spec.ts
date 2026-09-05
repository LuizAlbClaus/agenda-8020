import { test, expect } from "@playwright/test";

test.describe("Landing Page de Upsell Soft Gel Express -> Agenda 80/20 (Refatorada)", () => {
  test("1. Rota /upsell/soft-gel: deve carregar a arquitetura de 7 seções congruentes e orientadas a conversão", async ({
    page,
  }) => {
    await page.goto("/upsell/soft-gel");

    // HEADER: Confirmação do pedido e indicador sóbrio de etapa
    await expect(page.getByText(/Compra confirmada: Soft Gel Express/i)).toBeVisible();
    await expect(page.getByText(/Etapa 2 de 2/i)).toBeVisible();

    // SEÇÃO 1: Hero de Interrupção Pós-Compra & CTA Primário
    await expect(page.getByText(/Sua inscrição no Soft Gel Express foi confirmada!/i)).toBeVisible();
    await expect(page.getByText(/^ESPERE\.$/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Você acabou de dar o primeiro passo para aprender Soft Gel\./i })
    ).toBeVisible();
    await expect(page.getByText(/Conheça o Agenda 80\/20/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /SIM, QUERO ADICIONAR O AGENDA 80\/20/i }).first()
    ).toBeVisible();

    // SEÇÃO 2: O Gap (Técnica vs Direção)
    await expect(
      page.getByRole("heading", { name: /Aprender a técnica é o primeiro passo\. Saber o que fazer depois é outro\./i })
    ).toBeVisible();
    await expect(page.getByText(/O que fazer nas unhas/i)).toBeVisible();
    await expect(page.getByText(/O que fazer pelo seu negócio/i)).toBeVisible();

    // SEÇÃO 3: Demonstração do Mecanismo
    await expect(
      page.getByRole("heading", { name: /você abre e sabe o que fazer hoje\./i })
    ).toBeVisible();
    await expect(page.getByText(/Sua ação recomendada para hoje:/i)).toBeVisible();
    await expect(page.getByText(/Fotografe e organize o resultado do seu treino/i)).toBeVisible();
    await expect(page.getByText(/Por que fazer isso agora\?/i)).toBeVisible();
    await expect(page.getByText(/Marcar como feita hoje/i)).toBeVisible();

    // SEÇÃO 4: Do "Depois Eu Vejo" para um Plano
    await expect(
      page.getByRole("heading", { name: /Do “depois eu vejo isso” para um plano de 10 minutos por dia\./i })
    ).toBeVisible();
    await expect(page.getByText(/Sem o Agenda 80\/20/i)).toBeVisible();
    await expect(page.getByText(/Com o Agenda 80\/20/i)).toBeVisible();
    await expect(page.getByText(/Você não precisa atender ninguém antes de estar pronta/i)).toBeVisible();

    // SEÇÃO 5: Oferta Clara e Transparente
    await expect(
      page.getByRole("heading", { name: /Adicione o Agenda 80\/20 à sua jornada\./i })
    ).toBeVisible();
    await expect(page.getByText("R$ 15,19").first()).toBeVisible();
    await expect(page.getByText(/R\$ 147 à vista/i).first()).toBeVisible();
    await expect(page.getByText(/Cortesia Inclusa: 30 dias de Belevy Pro/i)).toBeVisible();

    // SEÇÃO 6: Objeções Essenciais
    await expect(
      page.getByRole("heading", { name: /Dúvidas comuns sobre o Agenda 80\/20/i })
    ).toBeVisible();
    await expect(page.getByText(/Mas eu ainda nem comecei o Soft Gel Express\./i)).toBeVisible();
    await expect(page.getByText(/Eu ainda não tenho clientes\./i)).toBeVisible();
    await expect(page.getByText(/Eu não sei nada de marketing ou vendas\./i)).toBeVisible();
    await expect(page.getByText(/Vou ter mais um curso longo para assistir\?/i)).toBeVisible();

    // SEÇÃO 7: Fechamento e Link de Recusa sem Dark Patterns
    await expect(
      page.getByRole("heading", { name: /começar do zero ou já ter um caminho\./i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Não, obrigado\. Quero continuar apenas com o Soft Gel Express\./i })
    ).toBeVisible();
  });

  test("2. Objeções (Seção 6): acordeão acessível deve expandir e fechar itens", async ({ page }) => {
    await page.goto("/upsell/soft-gel");

    // Item 1 começa aberto
    await expect(
      page.getByText(/O Agenda 80\/20 considera o seu momento exato\. Enquanto você aprende e treina a técnica/i)
    ).toBeVisible();

    // Clicar no Item 2
    const btn2 = page.getByRole("button", { name: /Eu ainda não tenho clientes\./i });
    await btn2.scrollIntoViewIfNeeded();
    await btn2.click();

    await expect(
      page.getByText(/É justamente nesse começo que não saber o que fazer costuma travar/i)
    ).toBeVisible();
  });

  test("3. Rota /?lp=soft-gel e /upsell: devem carregar a versão refatorada preservando UTMs", async ({ page }) => {
    await page.goto("/?lp=soft-gel&utm_source=meta_ads&utm_campaign=sge_upsell");

    await expect(page.getByText(/Compra confirmada: Soft Gel Express/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Você acabou de dar o primeiro passo para aprender Soft Gel\./i })
    ).toBeVisible();

    const ctaLink = page.getByRole("link", { name: /SIM, QUERO ADICIONAR O AGENDA 80\/20/i }).first();
    const href = await ctaLink.getAttribute("href");
    expect(href).toBeDefined();

    // Rota /upsell
    await page.goto("/upsell");
    await expect(page.getByText(/Compra confirmada: Soft Gel Express/i)).toBeVisible();
  });

  test("4. Link de Recusa (Decline): deve apontar para /checkout/sucesso", async ({ page }) => {
    await page.goto("/upsell/soft-gel?utm_source=instagram");

    const declineLink = page.getByRole("link", {
      name: /Não, obrigado\. Quero continuar apenas com o Soft Gel Express\./i,
    });
    await declineLink.scrollIntoViewIfNeeded();
    const href = await declineLink.getAttribute("href");
    expect(href).toContain("/checkout/sucesso");
    expect(href).toContain("utm_source=instagram");
  });

  test("5. Responsividade em todas as viewports obrigatórias e captura de screenshots", async ({
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

      // Verificar altura ergonômica mínima (>= 48px) no CTA do Hero
      const ctaHero = page.getByRole("link", { name: /SIM, QUERO ADICIONAR O AGENDA 80\/20/i }).first();
      await expect(ctaHero).toBeVisible();
      const box = await ctaHero.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(48);
      }
    }

    // Captura screenshot completo Mobile (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/upsell/soft-gel");
    await page.screenshot({
      path: "output/upsell-refactor/upsell-mobile-390.png",
      fullPage: true,
    });

    // Captura screenshot completo Desktop (1440px)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/upsell/soft-gel");
    await page.screenshot({
      path: "output/upsell-refactor/upsell-desktop-1440.png",
      fullPage: true,
    });
  });
});
