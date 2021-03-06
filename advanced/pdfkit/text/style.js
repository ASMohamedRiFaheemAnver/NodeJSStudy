const PDFDocument = require("pdfkit");
const fs = require("fs");

const doc = new PDFDocument();

doc.pipe(fs.createWriteStream("style.pdf"));

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. Ut nec accumsan nisl. Suspendisse rhoncus nisl posuere tortor tempus et dapibus elit porta. Cras leo neque, elementum a rhoncus ut, vestibulum non nibh. Phasellus pretium justo turpis. Etiam vulputate, odio vitae tincidunt ultricies, eros odio dapibus nisi, ut tincidunt lacus arcu eu elit. Aenean velit erat, vehicula eget lacinia ut, dignissim non tellus. Aliquam nec lacus mi, sed vestibulum nunc. Suspendisse potenti. Curabitur vitae sem turpis. Vestibulum sed neque eget dolor dapibus porttitor at sit amet sem. Fusce a turpis lorem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;";

doc.text(lorem, {
  columns: 3,
  columnGap: 15,
  height: 100,
  width: 465,
  align: "justify",
});

/*
 *The list method creates a bulleted list. It accepts as arguments an array of strings, and the optional x, y position.
 *You can create complex multilevel lists by using nested arrays. Lists use the following additional options
 */
doc.list(["bulletRadius", "textIndent", "bulletIndent"]);

doc
  .fillColor("green")
  .text(lorem.slice(0, 500), {
    width: 465,
    continued: true,
  })
  .fillColor("red")
  .text(lorem.slice(500));

doc.end();
