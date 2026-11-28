import { ProtectSimulator } from "@/components/protect-simulator";
import { getProtectScenario } from "@/lib/protect-simulation";

export const instant = false;

type SimulationPageProps = {
  searchParams: Promise<{
    escenario?: string | string[];
    estado?: string | string[];
  }>;
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProtectSimulationPage({
  searchParams,
}: SimulationPageProps) {
  const params = await searchParams;
  const scenario = getProtectScenario(params.escenario);
  const estado = firstValue(params.estado);
  const initialPhase =
    estado === "error" ? "error" : estado === "cargando" ? "loading" : "received";

  return (
    <ProtectSimulator
      key={`${scenario}-${initialPhase}`}
      scenario={scenario}
      initialPhase={initialPhase}
    />
  );
}
