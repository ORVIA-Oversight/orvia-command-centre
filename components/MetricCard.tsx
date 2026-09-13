export function MetricCard({ label, value, detail, tone }: { label:string; value:string|number; detail:string; tone:'gold'|'purple'|'teal'|'orange' }){
  return <article className={`metricCard tone-${tone}`}><small>{label}</small><strong>{value}</strong><span>{detail}</span></article>
}
