"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  Smartphone,
  Download,
  CheckCircle2,
  Share,
  PlusSquare,
  MoreVertical,
  X,
  Sparkles,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function subscribeStandalone(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(display-mode: standalone)");
  mediaQuery.addEventListener("change", callback);
  window.addEventListener("appinstalled", callback);
  return () => {
    mediaQuery.removeEventListener("change", callback);
    window.removeEventListener("appinstalled", callback);
  };
}

function getStandaloneSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function getStandaloneServerSnapshot(): boolean {
  return false;
}

function subscribeNoop() {
  return () => {};
}

function getPlatformSnapshot(): "ios" | "android" | "other" {
  if (typeof window === "undefined") return "other";
  const userAgent = window.navigator.userAgent || "";
  const isIOSDevice =
    /iPad|iPhone|iPod/.test(userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;
  if (isIOSDevice) return "ios";
  if (/Android/.test(userAgent)) return "android";
  return "other";
}

function getPlatformServerSnapshot(): "ios" | "android" | "other" {
  return "other";
}

export function InstallAppCard() {
  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot
  );

  const platform = useSyncExternalStore(
    subscribeNoop,
    getPlatformSnapshot,
    getPlatformServerSnapshot
  );

  const [hasInstalledEvent, setHasInstalledEvent] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [selectedTab, setSelectedTab] = useState<"ios" | "android" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const activeTab: "ios" | "android" =
    selectedTab ?? (platform === "ios" ? "ios" : "android");

  const isInstalled = isStandalone || hasInstalledEvent;

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setHasInstalledEvent(true);
      setDeferredPrompt(null);
      setIsModalOpen(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleNativeInstall() {
    if (!deferredPrompt) return;
    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setHasInstalledEvent(true);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Install prompt error:", err);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  }

  function handlePrimaryButtonClick() {
    if (deferredPrompt) {
      handleNativeInstall();
    } else {
      setIsModalOpen(true);
    }
  }

  return (
    <>
      <section
        aria-labelledby="install-app-heading"
        className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-[var(--color-action-subtle)] text-[var(--color-action-primary)]">
              <Smartphone className="size-4" aria-hidden="true" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
              Aplicativo no Celular
            </span>
          </div>

          {isInstalled ? (
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-revenue-subtle)] px-2.5 py-1 text-xs font-bold text-[var(--color-revenue-primary)]">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Instalado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink-muted)]">
              Android & iOS
            </span>
          )}
        </div>

        <h2 id="install-app-heading" className="mt-3 text-base sm:text-lg font-bold text-[var(--color-ink-solid)]">
          {isInstalled ? "Aplicativo ativo no seu celular" : "Instalar Agenda 80/20 na sua tela inicial"}
        </h2>

        <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
          {isInstalled
            ? "A Agenda 80/20 já está adicionada como aplicativo. Você pode abri-la diretamente pelo ícone na tela inicial do seu celular, sem barra de navegador."
            : "Tenha a experiência completa de aplicativo: abra a Agenda 80/20 com 1 toque na tela de início, em tela cheia e sem precisar digitar endereço no navegador."}
        </p>

        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {isInstalled ? (
            <div className="flex items-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-revenue-subtle)] px-4 py-3 text-xs sm:text-sm font-semibold text-[var(--color-revenue-primary)]">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
              <span>Você já está usando a Agenda 80/20 instalada neste aparelho.</span>
            </div>
          ) : (
            <>
              {deferredPrompt ? (
                <button
                  type="button"
                  onClick={handleNativeInstall}
                  disabled={isInstalling}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[var(--color-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] disabled:opacity-60"
                >
                  <Download className="size-4" aria-hidden="true" />
                  <span>{isInstalling ? "Instalando…" : "Instalar agora (1 clique)"}</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={handlePrimaryButtonClick}
                className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-button)] px-5 text-sm font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  deferredPrompt
                    ? "border border-[var(--color-border-strong)] bg-white text-[var(--color-ink-solid)] hover:bg-[var(--color-surface-muted)] focus-visible:outline-[var(--color-action-primary)]"
                    : "bg-[var(--color-action-primary)] text-white shadow-sm hover:bg-[var(--color-action-hover)] focus-visible:outline-[var(--color-action-primary)]"
                }`}
              >
                <Smartphone className="size-4" aria-hidden="true" />
                <span>
                  {platform === "ios"
                    ? "Como instalar no iPhone"
                    : platform === "android"
                    ? "Como instalar no Android"
                    : "Ver instruções para instalar"}
                </span>
              </button>
            </>
          )}
        </div>
      </section>

      {/* Modal / Sheet with Step-by-Step Instructions */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-[var(--radius-card)] bg-white p-6 shadow-2xl border border-[var(--color-border-subtle)] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#0C2A26] text-white">
                  <Smartphone className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="install-modal-title" className="text-lg font-bold text-[var(--color-ink-solid)]">
                    Instalar aplicativo
                  </h3>
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    Adicione o ícone na sua tela de início
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="inline-flex min-h-[48px] size-12 items-center justify-center rounded-[var(--radius-button)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-solid)]"
                aria-label="Fechar janela"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="mt-4 flex rounded-[var(--radius-button)] bg-[var(--color-surface-muted)] p-1 border border-[var(--color-border-subtle)]">
              <button
                type="button"
                onClick={() => setSelectedTab("ios")}
                className={`flex-1 min-h-[44px] rounded-[var(--radius-sm)] text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "ios"
                    ? "bg-white text-[var(--color-ink-solid)] shadow-xs"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
                }`}
              >
                📱 iPhone (iOS)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab("android")}
                className={`flex-1 min-h-[44px] rounded-[var(--radius-sm)] text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "android"
                    ? "bg-white text-[var(--color-ink-solid)] shadow-xs"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
                }`}
              >
                🤖 Android
              </button>
            </div>

            {/* iOS Instructions */}
            {activeTab === "ios" && (
              <div className="mt-5 space-y-4">
                <div className="rounded-[var(--radius-sm)] bg-[var(--color-canvas)] p-3 text-xs leading-relaxed text-[var(--color-ink-muted)] border border-[var(--color-border-subtle)]">
                  💡 No iPhone, a instalação é feita pelo navegador <strong>Safari</strong> em menos de 10 segundos:
                </div>

                <ol className="space-y-3.5 text-xs sm:text-sm text-[var(--color-ink-solid)]">
                  <li className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-3.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0C2A26] text-xs font-bold text-white">
                      1
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold">
                        Toque no botão de <strong>Compartilhar</strong>
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                        É o ícone de um quadrado com uma seta apontando para cima na barra inferior do Safari.
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-white border border-[var(--color-border-strong)] px-2.5 py-1 text-xs font-bold text-[#007AFF] shadow-2xs">
                        <Share className="size-3.5" aria-hidden="true" />
                        <span>Compartilhar</span>
                      </div>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-3.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0C2A26] text-xs font-bold text-white">
                      2
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold">
                        Role para baixo e toque em <strong>&ldquo;Adicionar à Tela de Início&rdquo;</strong>
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                        Localize o item com o ícone de sinal de mais (+).
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-white border border-[var(--color-border-strong)] px-2.5 py-1 text-xs font-bold text-[var(--color-ink-solid)] shadow-2xs">
                        <PlusSquare className="size-3.5 text-[var(--color-action-primary)]" aria-hidden="true" />
                        <span>Adicionar à Tela de Início</span>
                      </div>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-3.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0C2A26] text-xs font-bold text-white">
                      3
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold">
                        Toque em <strong>&ldquo;Adicionar&rdquo;</strong> no canto superior direito
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                        Pronto! O ícone da Agenda 80/20 aparecerá junto aos seus outros aplicativos.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            )}

            {/* Android Instructions */}
            {activeTab === "android" && (
              <div className="mt-5 space-y-4">
                {deferredPrompt ? (
                  <div className="rounded-[var(--radius-card)] border border-[var(--color-revenue-primary)]/30 bg-[var(--color-revenue-subtle)] p-4 text-center">
                    <p className="text-xs sm:text-sm font-bold text-[var(--color-ink-solid)]">
                      Seu navegador suporta instalação direta!
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                      Você pode instalar em apenas 1 toque agora mesmo:
                    </p>
                    <button
                      type="button"
                      onClick={handleNativeInstall}
                      disabled={isInstalling}
                      className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-4 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[var(--color-action-hover)]"
                    >
                      <Download className="size-4" aria-hidden="true" />
                      <span>{isInstalling ? "Instalando…" : "Instalar Aplicativo Agora"}</span>
                    </button>
                  </div>
                ) : (
                  <div className="rounded-[var(--radius-sm)] bg-[var(--color-canvas)] p-3 text-xs leading-relaxed text-[var(--color-ink-muted)] border border-[var(--color-border-subtle)]">
                    💡 No Google Chrome do Android, siga estes 3 passos simples:
                  </div>
                )}

                <ol className="space-y-3.5 text-xs sm:text-sm text-[var(--color-ink-solid)]">
                  <li className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-3.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0C2A26] text-xs font-bold text-white">
                      1
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold">
                        Toque no menu de <strong>três pontos (⋮)</strong>
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                        Geralmente localizado no canto superior direito do Google Chrome.
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-white border border-[var(--color-border-strong)] px-2.5 py-1 text-xs font-bold text-[var(--color-ink-solid)] shadow-2xs">
                        <MoreVertical className="size-3.5" aria-hidden="true" />
                        <span>Menu de Opções</span>
                      </div>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-3.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0C2A26] text-xs font-bold text-white">
                      2
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold">
                        Toque em <strong>&ldquo;Instalar aplicativo&rdquo;</strong> ou <strong>&ldquo;Adicionar à tela inicial&rdquo;</strong>
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-white border border-[var(--color-border-strong)] px-2.5 py-1 text-xs font-bold text-[var(--color-action-primary)] shadow-2xs">
                        <Download className="size-3.5" aria-hidden="true" />
                        <span>Instalar aplicativo</span>
                      </div>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-3.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0C2A26] text-xs font-bold text-white">
                      3
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold">
                        Confirme clicando em <strong>&ldquo;Instalar&rdquo;</strong>
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                        O ícone oficial da Agenda 80/20 será adicionado automaticamente à sua tela inicial.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            )}

            {/* Benefits Footer */}
            <div className="mt-6 rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-3.5 text-xs text-[var(--color-ink-muted)] flex items-center gap-2 border border-[var(--color-border-subtle)]">
              <Sparkles className="size-4 shrink-0 text-[var(--color-action-primary)]" aria-hidden="true" />
              <span>
                O app instalado consome menos dados, abre instantaneamente e salva seu login com total segurança.
              </span>
            </div>

            {/* Close Button */}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-ink-solid)] px-4 text-sm font-bold text-white shadow-xs hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink-solid)]"
              >
                <span>Entendido</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
