
require('dotenv').config();

const fs = require('fs');

fs.readFile(process.env.Archivo, 'utf8', async (err, data) => {
  if (err) {
    console.error('Error al leer el archivo:', err);
    return;
  }
  const Datafup = JSON.parse(data);

  let Keys = '';
  
  Object.keys(Datafup).forEach(el => Keys+=`
INSERT INTO FupSections (Name, [Active]) VALUES ('${el}', 1);
`
);


 const cleaneddata =  Object.keys(Datafup)
    .map(el => ({"Section":el,arrs: Datafup[el].flat()}))
    .map(el => ({
        Section:el.Section, 
        arrs:el.arrs.map((k, index)=> Object.keys(k).map((n) => ({ 
            Id:k[n].Id, Question:k[n], 
            DisplayName:n, 
            Order:index, 
            Active:true}) ))
            .flat()
        }))
    .map( el => ({Section:el.Section,  Active:true, arrs:el.arrs.map(kk => ({
            Id:kk.Id,
            DisplayName:kk.DisplayName,
            Active:true,
            Order:kk.Order,
            Question: JSON.stringify(kk.Question)
        })
    ) }));


    const Subforms =  cleaneddata.map( el => ({ Section: el.Section, arrs:el.arrs.filter( k => JSON.parse(k.Question).Type == 24 )}));
    
    console.log(process.env.Archivo);
    
    fs.writeFileSync("jsondata.json", JSON.stringify(cleaneddata), err => console.log(err));
    fs.writeFileSync("Subforms.json", JSON.stringify(Subforms), err => console.log(err));
    fs.writeFileSync("Sections.sql", Keys, err => console.log(err));

});
