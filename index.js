const path = require('path');

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
            Question:{...k[n], DisplayName:n},  
            Order:index, 
            Active:true}) ))
            .flat()
        }))
    .map( el => ({Section:el.Section,  Active:true, arrs:el.arrs.map(kk => {
      
  
      AllQuestions.push (
        {
          Display:kk.Question.DisplayName,
          IdArcher:kk.Question.Id,
          LevelId:kk.Question.LevelId,
          Alias:kk.Question.Alias,
          TypeText:kk.Question.TypeText,
          Type:kk.Question.Type,
      
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
            
            const IdArcher = S[SQ].Id;
            delete S[SQ].Id;

            SubformsQuests.push(
                {
                  Display:SQ,
                  IdArcher,
                  ...S[SQ],
                  ...(S[SQ].RelatedValuesListId? {RelatedValuesListId:Object.values(S[SQ].RelatedValuesListId).map(I =>{ return  I })}:{}  )

                }
            );

              if( S[SQ].RelatedValuesListId ){

                  Object.keys(S[SQ].RelatedValuesListId).map( m => m).forEach( n => {

                    ValuesListIds.push(

                      { Display:n, IdArcher: S[SQ].RelatedValuesListId[n] }

                    )

                  } )

              }


          })
        })
     } )
    });




    
    const FupForms = [];
    const FupSectionsArr = [];
    const FupMain = [];


    cleaneddata.forEach( 
      (el, index) => {

      FupSectionsArr.push(
        {
          Name: el.Section, 
          Active:true, 
          Order: index+1
        }
      );

      FupForms.push( {
        IdSubSectionFK: index+1,
        Active:true,
        IdsArcher: JSON.stringify(

          el.arrs.map(m =>{
            
            FupMain.push({

              "IdArcher": m.IdArcher,
              "Active": true,
              "Order": 0,
              "Vinculated": []
            });

          return m.IdArcher })
        )
      });

    } );

        
   fs.writeFileSync("jsondata.json", JSON.stringify(cleaneddata), err => console.log(err));
   fs.writeFileSync("Subforms.json", JSON.stringify(Subforms), err => console.log(err));
   fs.writeFileSync("SubformsQuests.json", JSON.stringify(SubformsQuests), err => console.log(err));
   fs.writeFileSync("ValuesListIds.json", JSON.stringify(ValuesListIds), err => console.log(err));
   fs.writeFileSync("RelatedValuesListIdCleaned.json", JSON.stringify(RelatedValuesListIdCleaned), err => console.log(err));
   fs.writeFileSync("AllQuestions.json", JSON.stringify(AllQuestions.concat(SubformsQuests)), err => console.log(err));
   fs.writeFileSync("Sections.sql", Keys, err => console.log(err));

    const Arrkeys =  AllQuestions.concat( SubformsQuests ).map( a => Object.keys( a ) ).flat();

    let FupSubSections =  '';

    FupSectionsArr.forEach( (el, index) => {
      FupSubSections += `INSERT INTO FupSections ( [Name], IdSectionFK , Order ) VALUES ( '${el.Name}', idsectionfk ,${index+1} );
`;

  } );

   const folderPath = path.join(__dirname, "SQL");
   
   const File_FupSections_SQL = path.join(folderPath, "Sections.sql");
   const File_FupSubSections_SQL = path.join(folderPath, "SubSections.sql");
   const File_FupForms_SQL = path.join(folderPath, "FupForms.sql");
   const File_FupMain_SQL = path.join(folderPath, "FupMain.sql");
   const File_FupItems_SQL = path.join(folderPath, "FupItems.sql");

    if ( !fs.existsSync( folderPath ) )
    {
      fs.mkdirSync( folderPath, { recursive: true }); 
      console.log('Carpeta creada:', folderPath);
    }

    fs.mkdirSync(folderPath, { recursive: true });

    const FupSectionArraysSql = [ 
      "Descripción",
      "Recursos humanos",
      "Mercadotecnia",
      "Recursos Materiales", 
      "Operaciones",
      "Continuidad del Negocio",
      "Perfiles de Acceso",
      "Experiencia de del Cliente",
      "Jurídico",
      "Contraloría",
      "Administración de Riesgos",
      "Prevención de fraudes",
      "CISO",
      "Hiperpersonalización"
     ].map(el => `INSERT INTO FupSections ([Name]) VALUES('${el}');
`).join(" ");

console.log( FupMain );

const FupFormsArr = FupForms.map( el => `INSERT INTO FupForms ([IdSubSectionFK], IdsArcher) Values( ${el.IdSubSectionFK}, '${el.IdsArcher}' );
` ).join(' ');

const FupMainArr =  FupMain.map(el => `INSERT INTO FupMain ( IdArcher, Order, Vinculated ) VALUES( ${el.IdArcher}, 0, NULL );
`).join(' ');


const FupItemsArr  =  AllQuestions.map( el => `Insert INTO FupItem ([Display], IdArcher, Alias, TypeText, [Type], LevelId, RelatedValuesListId,  SubformFieldId, SubformData ) VALUES ('${el.Display}',${el.IdArcher},'${el.Alias}','${el.TypeText}',${el.Type}, ${el.LevelId}, ${(el?.RelatedValuesListId? "'"+JSON.stringify(el.RelatedValuesListId)+ "'," :"NULL," ) } ${el.SubformFieldId?el.SubformFieldId+",":"NULL," } ${el.SubformData? "'"+JSON.stringify(el.SubformData)+"'":"NULL"}); 
`).join(' ');

fs.writeFileSync( File_FupSections_SQL , FupSectionArraysSql, err => console.log(err));

fs.writeFileSync(  File_FupSubSections_SQL , FupSubSections, err => console.log(err));

fs.writeFileSync(  File_FupForms_SQL , FupFormsArr, err => console.log(err));

fs.writeFileSync(  File_FupMain_SQL , FupMainArr, err => console.log(err));

fs.writeFileSync(  File_FupItems_SQL , FupItemsArr, err => console.log(err));


});