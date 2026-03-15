export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const cols = [...row.children];
  if (cols.length < 2) return;

  // Column 1 = background image, Column 2 = text content
  cols[0].classList.add('hero-careers-bg');
  cols[1].classList.add('hero-careers-content');
}
