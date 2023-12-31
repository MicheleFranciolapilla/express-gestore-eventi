const   express         =   require("express");
// Importazione modello
const   EventModel      =   require("../models/EventModel");
// Oggetto con tutte le queries valide, suddivise per proprietà dell'evento
const   allowedFilters  =   {
                                title       :   ["t_with"],
                                description :   ["d_with"],
                                eventDate   :   ["f_exact", "f_before", "f_after"],
                                maxSeats    :   ["s_less_than", "s_more_than"]
                            };
// Oggetto con tutte le funzioni richiamabili per il filtraggio dei dati basato sulle queries
const   filterFunctions =   {
                                t_with(fromDB, fromQuery)
                                {
                                    console.log("t_with invocata");
                                    return findText(fromDB, fromQuery);
                                },
                                d_with(fromDB, fromQuery)
                                {
                                    console.log("d_with invocata");
                                    return findText(fromDB, fromQuery);
                                },
                                f_exact(fromDB, fromQuery)
                                {
                                    const   msecsInADay =   24 * 60 * 60 * 1000;
                                    const   dayStartsAt =   timeFromDate(fromQuery);
                                    const   dayEndsAt   =   dayStartsAt + msecsInADay;
                                    const   DBEventDate =   timeFromDate(fromDB);

                                    console.log("f_exact invocata");
                                    return  ((dayStartsAt <= DBEventDate) && (dayEndsAt >= DBEventDate));
                                },
                                f_before(fromDB, fromQuery)
                                {
                                    const   queryDate   =   timeFromDate(fromQuery);
                                    const   DBEventDate =   timeFromDate(fromDB);

                                    console.log("f_before invocata");
                                    return  DBEventDate < queryDate;
                                },
                                f_after(fromDB, fromQuery)
                                {
                                    const   msecsInADay =   24 * 60 * 60 * 1000;
                                    const   queryDate   =   timeFromDate(fromQuery);
                                    const   DBEventDate =   timeFromDate(fromDB);

                                    console.log("f_after invocata");
                                    return  DBEventDate > (queryDate + msecsInADay);
                                },
                                s_less_than(fromDB, fromQuery)
                                {
                                    console.log("s_less_than invocata");
                                    return  parseInt(fromDB) < parseInt(fromQuery);
                                },
                                s_more_than(fromDB, fromQuery)
                                {
                                    console.log("s_more_than invocata");
                                    return  parseInt(fromDB) > parseInt(fromQuery);
                                },
                            };

function findText(fromDB, fromQuery)
{
    return fromDB.toLowerCase().includes(fromQuery.toLowerCase());
}

function timeFromDate(dateToCompute)
{
    const date = new Date(dateToCompute);
    return date.getTime();
}

function showAllEventsInstances()
{
    for (let i = 0; i < EventModel.eventInstances.length; i++)
    {
        console.log("******************************************");
        console.log(`Istanza nr ${i}:`);
        const instance = EventModel.getInstance(i);
        console.log(`ID :     ${instance.id}`);
        console.log(`title :     ${instance.title}`);
        console.log(`description :     ${instance.description}`);
        console.log(`eventDate :     ${instance.eventDate}`);
        console.log(`maxSeats :     ${instance.maxSeats}`);
        console.log("******************************************");
    }
}

function stringForResponse(filterFunctionName)
{
    switch (filterFunctionName)
    {
        case "t_with"       :   return "che include il testo ";
        case "d_with"       :   return "che include il testo ";
        case "f_exact"      :   return "data esatta: ";
        case "f_before"     :   return "data precedente a ";
        case "f_after"      :   return "data successiva a ";
        case "s_less_than"  :   return "con posti a sedere inferiori a ";
        case "s_more_than"  :   return "con posti a sedere superiori a ";
    }
}

// Funzione incaricata di filtrare le sole query valide (riscontrabili nell'oggetto "allowedFilters") e di mantenere, per le stesse, solo un valore, l'ultimo.
function getValidQueries(request)
{
    console.log("*******************************************");
    console.log("*******************************************");    
    console.log("*******************************************");
    console.log("Funzione getValidQueries");
    console.log("*******************************************");
    console.log("*******************************************");    
    console.log("*******************************************");

    let queryKeys       =   Object.keys(request.query);
    let rawQueryValues  =   Object.values(request.query);
    let queryValues     =   rawQueryValues.map( rawValue    =>
        {
            switch (typeof rawValue)
            {
                case "string"   :   return rawValue;
                case "object"   :   if (Array.isArray(rawValue))
                                        return rawValue[rawValue.length - 1];
                                    else
                                        throw new Error("Query invalida!");
                default         :   throw new Error("Query invalida!");
            }
        });
    let validQueries    =   {};
    if (queryKeys.length != 0)
    {
        for (let key in allowedFilters)
        {
            let queriesToRemove = [];
            for (let queryIndex = 0; queryIndex < queryKeys.length; queryIndex++)
            {
                if (allowedFilters[key].includes(queryKeys[queryIndex]))
                {
                    queriesToRemove.push(queryIndex);
                    if (EventModel.isValidProperty(key, queryValues[queryIndex]))
                        validQueries[key] = [queryKeys[queryIndex], queryValues[queryIndex]];
                }
            }
            queriesToRemove.forEach( queryIndexForRemoval   =>
                {
                    queryKeys.splice(queryIndexForRemoval, 1);
                    queryValues.splice(queryIndexForRemoval, 1);
                });
        }
    }
    return validQueries;
}

function applyFilters(filters, filtersAmount, arrayToFilter)
{
    // console.log("Inizio funzione....valori di filters: ", filters);
    const filteredEvents = arrayToFilter.filter( eventToBeFiltered =>
        {
            // console.log("Evento corrente: ", eventToBeFiltered);
            let filtersMatched = 0;
            for (let key in filters)
            {
                const   functionToCall  =   filters[key][0];
                const   datafromQuery   =   filters[key][1];
                const   dataFromEvent   =   eventToBeFiltered[key];
                // console.log("key: ", key);
                // console.log("Funzione da chiamare: ", functionToCall);
                // console.log("Dati dalla query: ", datafromQuery);
                // console.log("Dati dall'evento: ", dataFromEvent);
                // if (filterFunctions.hasOwnProperty(functionToCall))
                // {
                    const filteringResult = filterFunctions[functionToCall](dataFromEvent, datafromQuery);
                    if (filteringResult)
                        filtersMatched++;
                // }
            }
            return (filtersMatched == filtersAmount);
        });
    // console.log("eventi filtrati nella funzione: ", filteredEvents);
    return filteredEvents;
}

function index(request, response)
{
    const   eventsInDB  =   EventModel.eventsInDB();
    if (eventsInDB != 0)
    {
        var     validQueries    =   getValidQueries(request);
        var     queriesAmount   =   Object.keys(validQueries).length;
        var     allEvents       =   EventModel.getAllEvents();
        // console.log("queries valide: ", validQueries);
        // console.log("nr di queries: ", queriesAmount);
        if (queriesAmount != 0)
            allEvents = applyFilters(validQueries, queriesAmount, allEvents);
        // console.log("eventi filtrati: ", allEvents);
    }
    // showAllEventsInstances();
    response.format({
                        html:       ()  =>
                            {
                                response.type("html");
                                if (eventsInDB == 0)
                                    response.send("<h1>Non ci sono eventi nel database.</h1>");
                                else
                                {
                                    let filterMsg = [];
                                    if (queriesAmount != 0)
                                    {
                                        filterMsg.push('<h1 style="color:blue;">Filtri applicati:</h1>');
                                        filterMsg.push("<ul>");
                                        for (let key in validQueries)
                                        {
                                            filterMsg.push(`<li><h3>Filtro sulla chiave (${key}).... <span>${stringForResponse(validQueries[key][0])} </span><span>${validQueries[key][1]}</span></h3></li>`);
                                        };
                                        filterMsg.push("</ul>");
                                    }
                                    let output = ["<ul>"];
                                    allEvents.forEach( singleEvent  =>
                                        {
                                            output.push("<li>");
                                            for (let key in singleEvent)
                                                // if (singleEvent.hasOwnProperty(key))
                                                {
                                                    let tagOpen     =   `<a href="/events/${singleEvent.id}"><h1>`;
                                                    let tagClose    =   "</h1></a>"; 
                                                    if (!["id", "title"].includes(key))
                                                    {
                                                        tagOpen     =   "<h3>";
                                                        tagClose    =   "</h3>";
                                                    }
                                                    output.push(`${tagOpen}${key}:   ${singleEvent[key]}${tagClose}`);
                                                }
                                            output.push("</li>");
                                        });
                                    output.push("</ul>");
                                    response.send(filterMsg.join("").concat(output.join("")));
                                }
                            },
                        default:    ()  =>
                            {   
                                    let firstMessage = {};
                                    if (queriesAmount != 0)
                                    {
                                        var filterMsg = { "Totale filtri applicati" :   queriesAmount};
                                        var filtersArray = [];
                                        for (let key in validQueries)
                                        {
                                            filtersArray.push(`Filtro sulla chiave (${key}).... ${stringForResponse(validQueries[key][0])} ${validQueries[key][1]}`);
                                        };
                                        firstMessage.Filtri = [filterMsg, filtersArray];
                                    }
                                let jsonResponse = { "Totale eventi" : allEvents.length};
                                if (eventsInDB != 0)
                                    jsonResponse.Eventi = allEvents;
                                response.json([firstMessage, jsonResponse]);
                            }
                    });
}

function show(request, response)
{
    const actualEvent   = EventModel.getEvent(request.params.event);
    // showAllEventsInstances();
    response.format({
                        html:       ()  =>
                            {
                                response.type("html");
                                let output = [];
                                for (let key in actualEvent)
                                    // if (actualEvent.hasOwnProperty(key))
                                    {
                                        let tagOpen     =   '<h1>';
                                        let tagClose    =   "</h1>"; 
                                        if (!["id", "title"].includes(key))
                                        {
                                            tagOpen     =   "<h3>";
                                            tagClose    =   "</h3>";
                                        }
                                        output.push(`${tagOpen}${key}:   ${actualEvent[key]}${tagClose}`);
                                    }
                                response.send(output.join(""));
                            },
                        default:    ()  =>
                            {
                                response.json(actualEvent);
                            }
                    });
}

function store(request, response)
{
    const {title, description, eventDate, maxSeats} =   request.body;
    const newEvent                                  =   new EventModel(title, description, eventDate, maxSeats);
    const newEventId                                =   EventModel.getLastGeneratedId();
    const newEventConfirmed                         =   EventModel.getEvent(newEventId);
    // showAllEventsInstances();
    response.format({
                        html:       ()  =>
                            {
                                response.type("html");
                                let output = ['<h1 style="text-align:center; color:blue; text-decoration:underscore;">Evento generato con successo</h1>'];
                                output.push(`<h2 style="text-align:center; color:blue; text-decoration:underscore;">Id associato all'evento: ${newEventId}</h2>`);
                                let flexBox     =   '<div style="display:flex; justify-content:space-evenly; width:100vw;">@</div>';
                                let leftBox     =   '<div style="padding:15px; display:flex; flex-direction:column; align-items:start; gap:1vh; border:2px solid green;">@</div>';
                                let rightBox    =   '<div style="padding:15px; display:flex; flex-direction:column; align-items:start; gap:1vh; border:2px solid yellowgreen;">@</div>';
                                let leftData    =   ['<h3 style="font-style:italic; align-self: center;">Dati inviati:</h3>'];
                                let rightData   =   ['<h3 style="font-style:italic; align-self: center;">Dati salvati:</h3>'];
                                for (let key in newEventConfirmed)
                                {
                                    if (key != "id")
                                    {
                                        leftData.push(`<h5 style="font-style:italic; color:blue;">${key} : <span style="font-style:normal; color:black;">${request.body[key]}</span></h5>`);
                                        rightData.push(`<h5 style="font-style:italic; color:blue;">${key} : <span style="font-style:normal; color:black;">${newEventConfirmed[key]}</span></h5>`);
                                    }
                                }
                                leftBox     =   leftBox.replace("@", leftData);
                                console.log(leftBox);
                                rightBox    =   rightBox.replace("@", rightData);
                                console.log(leftBox);
                                flexBox     =   flexBox.replace("@", leftBox.concat(rightBox));
                                output.push(flexBox);
                                response.send(output.join(""));
                            },
                        default:    ()  =>
                            {
                                let sent    =   {};
                                let saved   =   {};
                                for (let key in newEventConfirmed)
                                {
                                    if (key != "id")
                                    {
                                        sent[key]   =    request.body[key];
                                        saved[key]  =    newEventConfirmed[key];
                                    }
                                }
                                response.json(  {
                                                    "Esito salvataggio evento"  :   "Evento registrato con successo",
                                                    "Id generato per l'evento"  :   newEventId,
                                                    "Dati inviati:"             :   sent,
                                                    "Dati salvati:"             :   saved
                                                });
                            }
                    });
}

function update(request, response)
{
    const   eventId                                     =   request.params.event;
    let     eventBeforeModify                           =   EventModel.getEvent(eventId);
    const   {title, description, eventDate, maxSeats}   =   request.body;
    const   modifiersObj                                =   {title, description, eventDate, maxSeats};
    EventModel.modifyEvent(eventId, modifiersObj);
    let     eventAfterModify                            =   EventModel.getEvent(eventId);
    delete eventBeforeModify.id;
    delete eventAfterModify.id;
    // showAllEventsInstances();
    response.format({
                        html:       ()  =>
                            {
                                response.type("html");
                                let output = ['<h1 style="color:blue; text-decoration:underscore;">Evento modificato con successo</h1>'];
                                output.push(`<h2 style="color:blue; text-decoration:underscore;">Id associato all'evento: ${eventId}</h2><br><br>`);
                                output.push('<h3 style="font-style:italic; color:green;">Evento prima della modifica:</h3>');
                                for (let key in eventBeforeModify)
                                    output.push(`<h5 style="font-style:italic; color:blue;">${key} : <span style="font-style:normal; color:black;">${eventBeforeModify[key]}</span></h5>`);
                                output.push('<br><h3 style="font-style:italic; color:yellowgreen;">Evento dopo la modifica:</h3>');
                                for (let key in eventAfterModify)
                                    output.push(`<h5 style="font-style:italic; color:blue;">${key} : <span style="font-style:normal; color:black;">${eventAfterModify[key]}</span></h5>`);
                                response.send(output.join(""));
                            },
                        default:    ()  =>
                            {

                                response.json(  {
                                                    "Evento modificato con successo"    :   `Id evento: ${eventId}`,
                                                    "Evento prima della modifica"       :   eventBeforeModify,
                                                    "Evento dopo la modifica"           :   eventAfterModify
                                                });
                            }
                    });
}

function destroy(request, response)
{
    const   eventId         =   request.params.event;
    const   eventToDelete   =   EventModel.getEvent(eventId);
    EventModel.deleteEvent(eventId);
    // showAllEventsInstances();
    response.format({
                        html:       ()  =>
                            {
                                response.type("html");
                                response.send(`<h1 style="color:red;">L'evento con id: ${eventId} - titolo: ${eventToDelete.title}, è stato cancellato come richiesto!</h1>`);
                            },
                        default:    ()  =>
                            {
                                response.json({ "Evento cancellato con successo"    :   `id: ${eventId} - titolo: ${eventToDelete.title}, non più presente nel DB!` });
                            }
                    });
}

module.exports  =   { index, show, store, update, destroy };