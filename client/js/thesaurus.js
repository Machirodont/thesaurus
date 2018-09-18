"use strict";
const MAX_FIELDS_COUNT=5;
const THESAURUS_BLOCK_ID="#thesaurus";
let rows;

$(document).ready(()=>
{	
	if(!$( THESAURUS_BLOCK_ID ).is("div")){
		return false;
	}
	$( THESAURUS_BLOCK_ID ).empty();
	
	let startButton=$( "<button></button>", 
		{ 
			text:"Новый справочник",
			click: function()
			{
				fieldSetPage();
			}
		} 
	);
	$( startButton ).appendTo( THESAURUS_BLOCK_ID );		
}
);


function fieldSetPage()
{
	function setFieldElement(){
		let el=$( "<div></div>", 
			{ 
				text:"",
				class:"setFieldBlock",
			} 
		);
		
		$("<input>",
			{
				type:"text",
				placeholder:"Введите название поля",
				pattern:".+",
				focus: function(){
					$(this).removeClass("wrong");
				}
				
			}
			
		).appendTo(el);
		
		$("<select><option value='string'>Строка</option><option value='number'>Число</option></select>",
		).appendTo(el);
		
		$("<input>",
			{
				type:"button",
				value:"Удалить поле",
				click:()=>el.remove()
			}
		).appendTo(el);
		return el;
	}

	$( THESAURUS_BLOCK_ID ).empty();	
	$( "<button></button>", 
		{ 
			text:"Добавить поле",
			click: () =>
			{
				if( $( THESAURUS_BLOCK_ID + " .setFieldBlock" ).length < MAX_FIELDS_COUNT ){
					$( THESAURUS_BLOCK_ID ).append(setFieldElement());
				}
			}
		} 
	).appendTo( THESAURUS_BLOCK_ID );
	
	$( "<button></button>", 
		{ 
			text:"Создать справочник",
			click: function()
			{
				rows = $( THESAURUS_BLOCK_ID + " .setFieldBlock" ).map( function(i,v){
					let rowChecked=true;
					let row={
							rowName: $(v).find("input[type='text']").val(),
							rowType: $(v).find("select").val()			
						}
					let rowNamePattern=new RegExp($(v).find("input[type='text']").attr("pattern"));
					if(row.rowName.match(rowNamePattern)===null || row.rowName.match(rowNamePattern)[0]!==row.rowName) rowChecked=false;
					
					if(rowChecked){
						return row;
					}
					else{
						$(v).find("input[type='text']").addClass("wrong");
						return false;
					}
				}
				).toArray();
				
				if( rows.reduce(
						function(acc,val)  { 							
							if(acc===false || val===false) return false;
							if(acc.indexOf(val.rowName)!==-1) return false; //Если одинаковые названия столбцов
							return [...acc,  val.rowName];
						},
						[]
					)
					!==false )
				{
					thesaurusPage();
				}
			}
		} 
	).appendTo(THESAURUS_BLOCK_ID);
	
	$( THESAURUS_BLOCK_ID ).append(setFieldElement());
}

function thesaurusPage()
{
	function thesaurusLine(){
		function thesaurusCell(name, type){
			let td=$("<td></td>",
				{
					class:"wrong"
				}
			);
			td.append( $(
					"<div></div>",
					{
						class: "cell",
						click: function() {
							$(this).addClass("nodisplay");
							td.find("input").removeClass("nodisplay");
							td.find("input").focus();					
						}				
					}
				)
			).append( $(
					"<input>",
					{
						class:"nodisplay cell",
						type:"text",
						focusout: function() {
							td.find("div").text($(this).val());					
							$(this).addClass("nodisplay");
							td.find("div").removeClass("nodisplay");					
							checkTable($( THESAURUS_BLOCK_ID + " table#editor"));					
						},
					}
				)
			);		
			return td;
		}
		
		let tr=$( "<tr></tr>");
		let removeLineButton=$( "<button>",
			{
				text:"Удалить строку",
				click: ()=>{
					tr.remove()
					checkTable($( THESAURUS_BLOCK_ID + " table#editor"));
				}			
			}
		).appendTo($("<td>"));
		
		rows.forEach( function(r){
				tr.append(thesaurusCell(r.rowName, r.rowType));
			}
		);
		tr.append(removeLineButton);	
		return tr;
	}	
	
	
	let tab=$( "<table></table>", { id : "editor"});
	let tabHeader = $( "<tr></tr>");
	let addLineButton=$( "<button>", 
		{
			text: "Добавить строку",
			click: function(){
				tab.append( thesaurusLine() ) ;
				checkTable($( THESAURUS_BLOCK_ID + " table#editor"));
			}		
		}
	);
	
	let saveButton=$( "<button>", 
		{
			class	: "saveButton",
			disabled: "disabled",
			text: "Сохранить",
			click: function(){
				checkTable(tab) ;
				$.ajax({
				  url: "http://127.0.0.1:1337",
				  type: "POST",
				  data:JSON.stringify({command:"write", dataTable:collectDataFromTable($( THESAURUS_BLOCK_ID + " table#editor"))}),
				  dataType : "json",
				  success : function(data){
					loadTable();				
				  },
				  error : function(err){
				  }
				});					
			}		
		}
	);
	
	let loadButton=$( "<button>", 
		{
			class	: "loadButton",
			text: "Загрузить",
			click: function(){
				loadTable();				
			}		
		}
	);
	
	rows.forEach( function(r){
			tabHeader.append ( 
				$( "<th></th>", 
					{ 
						text:r.rowName,
					} 
				)
			);
		}
	);
	
	$( THESAURUS_BLOCK_ID ).empty();
	$( THESAURUS_BLOCK_ID ).append(tab);	
	tab.append( tabHeader );
	tab.append( thesaurusLine() );
	tab.after( addLineButton );
	tab.after( saveButton );
	tab.after( loadButton );
}

function checkTable(tab){
	let tableCorrect=true;
	
	tab.find("tr").each( function(lineCount){
			if(lineCount>0){				
				$(this).find("td").each( function(cellCount){
						if($(this).find("input").val().trim()===""){
							$(this).addClass("wrong");
							tableCorrect=false;
						}
						else{
							$(this).removeClass("wrong");
						}						
					}
				);
			}
		}
	);
	
	if(tableCorrect){
		$( THESAURUS_BLOCK_ID + " .saveButton").prop("disabled", false);
	}
	else{
		$( THESAURUS_BLOCK_ID + " .saveButton").prop("disabled", true);
	}
	return tableCorrect;	
}

function collectDataFromTable(tab){	
	let data=tab.find("tr").map( 
			function(count,element){				
				let td= $(element).find("td").map( function(count,element){
					let field={};
					field[rows[count].rowName]=$(element).find("input").val().trim();
					return field;
				}
				);
				if(count>0){
					return  {cells:td.toArray()};
				}
			}
		).toArray();	
	return data;	
}

function loadTable(){
	$("table#loadedResult").remove();
	$("#loadedMsg").remove();
	$.ajax({
	  url: "http://127.0.0.1:1337",
	  type: "POST",
	  data:JSON.stringify({command:"load", dataTable:""}),
	  dataType : "json",
	  success : function(data){
		  if(data.length>0){
			  let loadedDataTab=$("<table>", { id : "loadedResult"});
			  let loadedDataMsg=$("<div>", {id : "loadedMsg", text:"Загружена сохраненная таблица из БД: "});
			  let loadedDataHeader=$("<tr>");
			  
			  data[0].cells.forEach(function(v){
				  $("<td>", { text: Object.keys(v)[0]}).appendTo(loadedDataHeader);
			  }
			  );
			  
			  loadedDataTab.append(loadedDataHeader);
			  
			  data.forEach(function(v){
					let loadedDataRow=$("<tr>");
					v.cells.forEach(function(v1){
							$("<td>", { text: v1[Object.keys(v1)[0]]}).appendTo(loadedDataRow);
						
						}
					);
					loadedDataTab.append(loadedDataRow);
				}
			  );
			  
			  $( THESAURUS_BLOCK_ID ).append(loadedDataMsg);
			  $( THESAURUS_BLOCK_ID ).append(loadedDataTab);
		  }
		  else{
			  let loadedDataMsg=$("<div>", {id : "loadedMsg", text:"Ошибка загрузки БД"});			  
			  $( THESAURUS_BLOCK_ID ).append(loadedDataMsg);
		  }
	  },
	  error : function(err){
	  }
	});		
}







