import { test, expect } from "@playwright/test";

test.describe("Landing Page Modular do Agenda 80/20", () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  });

  test("1. Variante COLD (Direct Response): Deve carregar o Hero com Growth Coach, todas as seções e demo interativa", async ({
    page,
  }) => {
    await page.goto("/?lp=cold");

    // 1. Hero checks
    await expect(page.getByText("1 ação de cada vez · feita para o seu momento")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Pare de postar sem retorno e acabe com os buracos na sua agenda/i })
    ).toBeVisible();
    await expect(
      page.getByText("Descubra exatamente o que fazer hoje no WhatsApp para fechar horários em 10 minutos")
    ).toBeVisible();

    // 2. Hero Mockup: Growth Coach protagonista
    await expect(page.getByText("Seu próximo movimento está pronto")).toBeVisible();
    await expect(page.getByText("Seu foco agora").first()).toBeVisible();
    await expect(page.getByText("10 min estimados").first()).toBeVisible();
    await expect(page.getByText("Por que agora?").first()).toBeVisible();

    // Alternar abas do script no Hero mockup
    await page.getByRole("button", { name: /^Áudio$/i }).first().click();
    await expect(page.getByText(/Guia de Áudio/i)).toBeVisible();
    await page.getByRole("button", { name: /^Texto$/i }).first().click();

    // Copiar mensagem no Hero
    await page.getByRole("button", { name: /Copiar Mensagem/i }).first().click();
    await expect(page.getByText("Copiado!")).toBeVisible();

    // 3. Seção Problema
    await expect(
      page.getByRole("heading", { name: /Você provavelmente já sabe coisas demais para fazer/i })
    ).toBeVisible();
    await expect(page.getByText("20 opções competindo pela sua atenção")).toBeVisible();
    await expect(page.getByText("Apenas 1 ação que faz sentido agora")).toBeVisible();

    // 4. Seção Mecanismo
    await expect(
      page.getByRole("heading", { name: /Seu negócio muda\. Sua próxima ação também deveria mudar/i })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Seu Momento" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Seu Gargalo" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Seus Sinais" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Próximo Movimento", exact: true })).toBeVisible();

    // 5. Seção Cenários Reais
    await expect(
      page.getByRole("heading", { name: /Veja o que ele faria no seu caso/i })
    ).toBeVisible();
    await expect(page.getByText(/Estou começando e ainda não tenho clientes/i)).toBeVisible();

    // 6. Demonstração Interativa
    await expect(
      page.getByRole("heading", { name: /Veja como seriam seus primeiros minutos no Agenda 80\/20/i })
    ).toBeVisible();

    // Clicar na situação "As pessoas perguntam o preço, mas somem"
    const conversionBtn = page.getByRole("radio", { name: /As pessoas perguntam o preço, mas somem/i });
    await expect(conversionBtn).toBeVisible();
    await conversionBtn.click();

    // Verifica que o painel atualizou para a nova situação
    await expect(page.getByText("Retome orçamentos pausados com pergunta consultiva")).toBeVisible();
    await expect(page.getByText(/Conversão & Copiloto/i)).toBeVisible();

    // Clicar na situação "Tenho horários vazios na semana"
    const emptySlotsBtn = page.getByRole("radio", { name: /Tenho horários vazios na semana/i });
    await emptySlotsBtn.click();
    await expect(page.getByText("Divulgue 2 horários prioritários para sua rede")).toBeVisible();

    // 7. Módulos de Suporte
    await expect(
      page.getByRole("heading", { name: /E quando o problema muda, o Agenda 80\/20 continua com você/i })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "SOS Copiloto de Conversas" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Radar de Retenção" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Diagnóstico de Percepção de Valor" })).toBeVisible();

    // 8. Posicionamento
    await expect(
      page.getByRole("heading", { name: /Você não precisa virar especialista em marketing/i })
    ).toBeVisible();

    // 9. Qualificação & Credibilidade
    await expect(
      page.getByRole("heading", { name: /Para quem o Agenda 80\/20 foi pensado/i })
    ).toBeVisible();
    await expect(page.getByText("O que o Agenda 80/20 não promete")).toBeVisible();

    // 10. Oferta Principal e Downsell
    await expect(page.getByText("12x de R$ 15,19").first()).toBeVisible();
    await expect(page.getByText(/R\$ 147 em pagamento único/i)).toBeVisible();

    // Testar modal de downsell
    const downsellTrigger = page.getByRole("button", { name: /Prefere validar por um período menor/i });
    await expect(downsellTrigger).toBeVisible();
    await downsellTrigger.click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Comece com o Plano Semestral")).toBeVisible();
    await expect(page.getByText("R$ 97", { exact: true })).toBeVisible();

    // Fechar modal de downsell
    await page.getByRole("button", { name: /Fechar modal/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // 11. Belevy Opcional
    await expect(page.getByRole("heading", { name: "E quando a sua operação crescer?" })).toBeVisible();

    // 12. FAQ Accordion
    const faqItem = page.getByRole("button", { name: /O Agenda 80\/20 serve para quem ainda não tem nenhuma cliente\?/i });
    await expect(faqItem).toBeVisible();
    await expect(page.getByText(/O sistema possui um motor com protocolos específicos para iniciantes/i)).toBeVisible();

    // 13. Fechamento
    await expect(
      page.getByRole("heading", { name: /Precisa sair sabendo qual é a próxima/i })
    ).toBeVisible();
  });

  test("2. Variante SOFT-GEL (Upsell): Deve carregar o fluxo de upsell dedicado", async ({
    page,
  }) => {
    await page.goto("/?lp=soft-gel");

    // Eyebrow e Headline de interrupção e continuidade pós-curso
    await expect(page.getByText(/Sua compra do Soft Gel Express foi confirmada/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /^ESPERE\.$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /SIM! ADICIONAR O AGENDA 80\/20 AO MEU PEDIDO/i }).first()).toBeVisible();

    // A versão soft-gel NÃO deve exibir o bloco longo do problema
    await expect(page.getByText("20 opções competindo pela sua atenção")).not.toBeVisible();
  });

  test("3. Variante ORGANIC (Audiência Aquecida): Deve carregar com comunicação direta", async ({
    page,
  }) => {
    await page.goto("/?lp=organic");

    // Headline orgânica direta
    await expect(
      page.getByRole("heading", { name: /Um aplicativo que te ajuda a decidir o que fazer hoje para movimentar seu serviço/i })
    ).toBeVisible();
    await expect(
      page.getByText("Não mais uma lista de estratégias. Uma próxima ação para o momento em que você realmente está.")
    ).toBeVisible();

    // Deve exibir o mecanismo e cenários
    await expect(page.getByText("Seu negócio muda. Sua próxima ação também deveria mudar.")).toBeVisible();
    await expect(page.getByText("Veja o que ele faria no seu caso.")).toBeVisible();
  });
});
