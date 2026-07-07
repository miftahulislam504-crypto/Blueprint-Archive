import ContactDesk from "@/components/ContactDesk";
import { PROJECTS } from "@/data/projects";

export default function Home() {
  return (
    <main>
      <section id="cover" style={{ height: "200vh" }}>
        <div className="sr-only">
          <h1>The Archive — Miftahul Islam</h1>
          <p>
            A drafted archive of real, shipped projects by a civil engineer
            who builds his own tools, working from Sirajganj, Bangladesh.
          </p>
        </div>
      </section>

      {PROJECTS.map((project, i) => (
        <section
          key={project.id}
          id={`sheet-${i}`}
          data-sheet-index={i}
          style={{ height: "130vh" }}
        >
          <div className="sr-only">
            <h2>
              {project.sheetNumber} — {project.title}
            </h2>
            <p>{project.system}</p>
            <p>{project.description}</p>
            <ul>
              {project.stack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {project.href && <a href={project.href}>Visit live site</a>}
          </div>
        </section>
      ))}

      <section id="desk" style={{ height: "220vh" }}>
        <div className="sticky top-0 h-screen">
          <ContactDesk />
        </div>
      </section>
    </main>
  );
}
