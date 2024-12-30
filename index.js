const fs = require('fs');

fs.readFile('Dic_Aplicativo_Predictamen_191124.json', 'utf8', async (err, data) => {
  if (err) {
    console.error('Error al leer el archivo:', err);
    return;
  }
  const Datafup = JSON.parse(data);
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
    ) }))

    console.log(cleaneddata);
    
    fs.writeFileSync("jsondata.json", JSON.stringify(cleaneddata), err => console.log(err));
});
