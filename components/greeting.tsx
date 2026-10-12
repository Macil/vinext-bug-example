import { Counter } from "./counter";

async function getGreeting(name: string) {
  return `Hello, ${name}`;
}

export async function Greeting({ name }: { name: string }) {
  const greeting = await getGreeting(name);

  return (
    <section>
      <h2>{greeting}</h2>
      <Counter initial={1} />
    </section>
  );
}
