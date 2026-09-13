export function Topbar({ title, eyebrow = 'ORVIA OVERSIGHT LTD · FOUNDER WORKSPACE' }: { title: string; eyebrow?: string }) {
  return (
    <header className="topbar">
      <div className="spectrum" />
      <div className="topbarInner">
        <div><small>{eyebrow}</small><h1>{title}</h1></div>
        <div className="topMethod">
          <span className="mO">O <em>Observation</em></span><span className="mR">R <em>Reflection</em></span><span className="mV">V <em>Visibility</em></span><span className="mI">I <em>Insight</em></span><span className="mA">A <em>Accountability</em></span>
        </div>
        <div className="privatePill">INTERNAL · HUMAN CONTROLLED</div>
      </div>
    </header>
  );
}
