import { test, expect } from "@playwright/test";

test.describe("Jornada da Usuária Autônoma no Agenda 80/20", () => {
  test.beforeEach(async ({ page, context }) => {
    // Permite acesso à área de transferência para simulação fiel de cópia em mobile
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    // Acessa a tela inicial / demonstração
    await page.goto("/demo");
  });

  test("1. SOS Copiloto: Deve abrir a gaveta, navegar nas 4 objeções, alternar texto/áudio e revelar a lógica psicológica", async ({
    page,
  }) => {
    // 1. Localiza e clica no botão flutuante SOS Copiloto
    const copilotBtn = page.getByRole("button", { name: /SOS Copiloto/i });
    await expect(copilotBtn).toBeVisible();
    await copilotBtn.click();

    // 2. Verifica se a gaveta do Copiloto abriu
    await expect(page.getByRole("heading", { name: "SOS Copiloto de Vendas" })).toBeVisible();

    // 3. Testa a revelação progressiva da psicologia por trás da mensagem
    const rationaleToggle = page.getByRole("button", { name: /Por que essa mensagem funciona\?/i });
    await expect(rationaleToggle).toBeVisible();
    await rationaleToggle.click();

    // Verifica se o texto explicativo apareceu
    await expect(page.getByText("O que a cliente realmente sente")).toBeVisible();
    await expect(page.getByText("A psicologia por trás do texto")).toBeVisible();

    // 4. Alterna para o Roteiro de Áudio
    const audioToggle = page.getByRole("button", { name: /Roteiro de Áudio/i });
    await audioToggle.click();

    // Verifica se o Teleprompter de Áudio apareceu com tempo estimado e guia de tom
    await expect(page.getByText(/Duração: ~/i)).toBeVisible();
    await expect(page.getByText(/Tom recomendado:/i)).toBeVisible();

    // 5. Alterna de volta para Texto e copia a mensagem pronta
    const textToggle = page.getByRole("button", { name: /^Texto$/i });
    await textToggle.click();

    const copyBtn = page.getByRole("button", { name: /Copiar Mensagem Pronta/i });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    // Verifica o feedback de confirmação
    await expect(page.getByText("Copiado com sucesso!")).toBeVisible();

    // 6. Navega pelas outras abas de objeção (role tab/button)
    await page.getByRole("tab", { name: "Vou Ver e Te Aviso" }).or(page.getByRole("button", { name: "Vou Ver e Te Aviso" })).click();
    await expect(page.getByText(/vou deixar a vaga/i)).toBeVisible();

    await page.getByRole("tab", { name: "Ver com Marido" }).or(page.getByRole("button", { name: "Ver com Marido" })).click();
    await expect(page.getByText(/marido até prefere/i)).toBeVisible();

    await page.getByRole("tab", { name: "Só o Preço" }).or(page.getByRole("button", { name: "Só o Preço" })).click();
    await expect(page.getByText(/dependendo do estado atual/i)).toBeVisible();

    // 7. Fecha o Copiloto
    await page.getByRole("button", { name: "Fechar copiloto" }).click();
    await expect(page.getByRole("heading", { name: "SOS Copiloto de Vendas" })).not.toBeVisible();
  });

  test("2. Retenção Biológica: Deve exibir oportunidades no ciclo ideal com botão de WhatsApp", async ({
    page,
  }) => {
    // 1. Verifica se a seção de Retenção Biológica está visível
    await expect(page.getByRole("heading", { name: /Janela de Ouro de Retorno/i })).toBeVisible();

    // 2. Verifica a cliente Camila Fernandes
    await expect(page.getByText("Camila Fernandes — Alongamento em Fibra de Vidro")).toBeVisible();
    await expect(page.getByText("Momento Biológico Perfeito")).toBeVisible();

    // 3. Verifica o botão de envio no WhatsApp
    const waButtons = page.getByRole("button", { name: /Enviar no WhatsApp/i });
    await expect(waButtons.first()).toBeVisible();
  });

  test("3. Micro-Auditoria de Valor em 45s: Deve guiar pelas 3 perguntas e permitir fluxo com 1 polegar", async ({
    page,
  }) => {
    // 1. Clica no botão para abrir a Micro-Auditoria
    const auditBtn = page.getByRole("button", { name: /Fazer Micro-Auditoria em 45s/i });
    await expect(auditBtn).toBeVisible();
    await auditBtn.click();

    // 2. Passo 1 de 3
    await expect(page.getByText("Passo 1 de 3")).toBeVisible();
    await expect(page.getByText("1. Como é o ritual de chegada da sua cliente?")).toBeVisible();

    // Seleciona uma opção
    await page.getByText("Ritual completo: xícara elegante").click();
    await page.getByRole("button", { name: "Continuar" }).click();

    // 3. Passo 2 de 3
    await expect(page.getByText("Passo 2 de 3")).toBeVisible();
    await expect(page.getByText("2. Como você demonstra biossegurança e esterilização?")).toBeVisible();

    await page.getByText("Abro a embalagem lacrada de autoclave").click();
    await page.getByRole("button", { name: "Continuar" }).click();

    // 4. Passo 3 de 3
    await expect(page.getByText("Passo 3 de 3")).toBeVisible();
    await expect(page.getByText("3. O que a cliente leva com ela ao sair do atendimento?")).toBeVisible();

    await page.getByText("Envelope VIP com guia de cuidados").click();

    // Verifica que o botão final mudou para 'Ver Meu Diagnóstico'
    await expect(page.getByRole("button", { name: /Ver Meu Diagnóstico/i })).toBeVisible();

    // Fecha a auditoria
    await page.getByRole("button", { name: "Fechar auditoria" }).click();
  });

  test("4. Micro-Aprendizagem (Pílula de Café em 1 min): Deve suportar áudio, troca de velocidade e cards em Stories", async ({
    page,
  }) => {
    // 1. Verifica se a Pílula do Café está visível
    await expect(page.getByText(/Pílula do Café • 50s/i)).toBeVisible();
    await expect(page.getByText("A Equação de Valor de Alex Hormozi")).toBeVisible();

    // 2. Testa o controle de velocidade do player de áudio (1x -> 1.25x -> 1.5x -> 1x)
    const speedBtn = page.getByRole("button", { name: "Alternar velocidade" });
    await expect(speedBtn).toHaveText("1x");
    await speedBtn.click();
    await expect(speedBtn).toHaveText("1.25x");
    await speedBtn.click();
    await expect(speedBtn).toHaveText("1.5x");
    await speedBtn.click();
    await expect(speedBtn).toHaveText("1x");

    // 3. Alterna para o modo 'Ler em Cards' (Estilo Stories)
    const cardsModeBtn = page.getByRole("button", { name: /Ler em Cards/i });
    await cardsModeBtn.click();

    // Verifica o primeiro card
    await expect(page.getByText("O Erro Comum")).toBeVisible();

    // Avança para o próximo card
    await page.getByRole("button", { name: /Próximo/i }).click();
    await expect(page.getByText("A Fórmula de Hormozi")).toBeVisible();

    // 4. Testa a cópia do script prático para WhatsApp
    const copyScriptBtn = page.getByRole("button", { name: /^Copiar$/i });
    await expect(copyScriptBtn).toBeVisible();
    await copyScriptBtn.click();
    await expect(page.getByText("Copiado!")).toBeVisible();
  });
});
