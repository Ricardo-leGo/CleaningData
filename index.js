
require('dotenv').config();

const fs = require('fs');

const ASss  = fs.readFile(process.env.Archivo, 'utf8', async (err, data) => {
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

const AllQuestions =  [];

 const cleaneddata =  Object.keys(Datafup)
    .map(el => ({"Section":el,arrs: Datafup[el].flat()}))
    .map(el => ({
        Section:el.Section, 
        arrs:el.arrs.map((k, index)=> Object.keys(k).map((n) => ({ 
            IdArcher:k[n].Id, 
            Question:k[n], 
            DisplayName:n, 
            Order:index, 
            Active:true}) ))
            .flat()
        }))
    .map( el => ({Section:el.Section,  Active:true, arrs:el.arrs.map(kk => {
      
  
      AllQuestions.push (
        {
          IdArcher:kk.Question.Id,
          Alias:kk.Question.Alias,
          TypeText:kk.Question.TypeText,
          Type:kk.Question.Type,
      
          LevelId:kk.Question.LevelId,
          ...(kk.Question.RelatedValuesListId? {RelatedValuesListId: Object.keys(kk.Question.RelatedValuesListId).map( R => kk.Question.RelatedValuesListId[R] )}: {} ),
          ...(kk.Question.SubformData? {SubformFieldId: kk.Question.SubformFieldId, SubformData: kk.Question.SubformData.map(m =>  Object.values(m)[0].Id)  } : {} )
        }
      );
      
      return ({
            IdArcher:kk.IdArcher,
            DisplayName:kk.DisplayName,
            Active:true,
            Order:kk.Order,
            Vinculated:[],
            // Question: JSON.stringify(kk.Question)
            Question:{
        IdArcher:kk.Question.Id,
        Alias:kk.Question.Alias,
        TypeText:kk.Question.TypeText,
        Type:kk.Question.Type,
    
        LevelId:kk.Question.LevelId,
        ...(kk.Question.RelatedValuesListId? {RelatedValuesListId: Object.keys(kk.Question.RelatedValuesListId).map( R => ({ Display: R, IdArcher:kk.Question.RelatedValuesListId[R] }))}: {} ),
        ...(kk.Question.SubformData? {SubformFieldId: kk.Question.SubformFieldId, SubformData: kk.Question.SubformData } : {} )
      }

        })}
      
      ) 
    }));

    //const Subforms =  cleaneddata.map( el => ({ Section: el.Section, arrs:el.arrs.filter( k => JSON.parse(k.Question).Type == 24 )}));
    const SubformsArrays =  cleaneddata.map( el => ({ Section: el.Section, arrs:el.arrs.filter( k =>{ return k.Question.Type == 24 } )}));
    const Subforms =  SubformsArrays.filter(el => el.arrs.length > 0 ) 
    
    const RelatedVuluesListIdArrays =  cleaneddata.map( el => ({ Section: el.Section, arrs:el.arrs.filter( k =>{return k.Question.Type == 4 } )}));
    const RelatedVuluesListId =  RelatedVuluesListIdArrays.filter(el => el.arrs.length > 0 );

    let ValuesListIds = [];

    RelatedVuluesListId.forEach( el => el.arrs.forEach( l => ValuesListIds= [...ValuesListIds, ...l.Question.RelatedValuesListId.map(k => k)] ));
    
    const RelatedValuesListIdCleaned =  cleaneddata.map( el => (
      { Section: el.Section, 
        
        arrs: el.arrs.map( R => ({...R, Question:{...R.Question, 
          ...(R.Question.RelatedValuesListId? {RelatedValuesListId:R.Question.RelatedValuesListId.map(I =>{ return  I.IdArcher })}:{}  ),
          ...(R.Question.SubformData? {SubformData:R.Question.SubformData.map(I =>{ return Object.values(I)[0].Id})}:{}  ),
        }}))}));

    let SubformsQuests = [];

    Subforms.forEach( el => {
       el.arrs.forEach( ({Question}) =>  {
        Question.SubformData.forEach( S => {
          Object.keys(S).forEach( SQ => {
            SubformsQuests.push(
                {
                  Display:SQ,
                  ...S[SQ]
                }
            );
          })
        })
     } )
    });


        
    fs.writeFileSync("jsondata.json", JSON.stringify(cleaneddata), err => console.log(err));
    fs.writeFileSync("Subforms.json", JSON.stringify(Subforms), err => console.log(err));
    fs.writeFileSync("SubformsQuests.json", JSON.stringify(SubformsQuests), err => console.log(err));
    fs.writeFileSync("ValuesListIds.json", JSON.stringify(ValuesListIds), err => console.log(err));
    fs.writeFileSync("RelatedValuesListIdCleaned.json", JSON.stringify(RelatedValuesListIdCleaned), err => console.log(err));
    fs.writeFileSync("AllQuestions.json", JSON.stringify(AllQuestions), err => console.log(err));
    fs.writeFileSync("Sections.sql", Keys, err => console.log(err));


});


