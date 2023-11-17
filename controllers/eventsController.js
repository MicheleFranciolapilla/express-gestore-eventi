// Importazione modello
const { json } = require("express");
const   eventModel  =   require("../models/EventModel");

function index(request, response)
{
    const   eventsInDB  = eventModel.eventsInDB();
    const   allEvents   = eventModel.getAllEvents();
    response.format({
                        html:       ()  =>
                            {
                                response.type("html");
                                if (eventsInDB == 0)
                                    response.send("<h1>Non ci sono eventi nel database.</h1>");
                                else
                                {
                                    let output = ["<ul>"];
                                    allEvents.forEach( singleEvent  =>
                                        {
                                            output.push("<li>");
                                            for (let key in singleEvent)
                                                if (singleEvent.hasOwnProperty(key))
                                                {
                                                    let tagOpen     =   '<a href="#"><h1>';
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
                                    response.send(output.join(""));
                                }
                            },
                        default:    ()  =>
                            {
                                let jsonResponse = { "Totale eventi" : eventsInDB};
                                if (eventsInDB != 0)
                                    jsonResponse.Eventi = allEvents;
                                response.json(jsonResponse);
                            }
                    });
}

function store(request, response)
{
    response.send("Sono il controller events/store (post)");
}

function update(request, response)
{
    response.send(`Sono il controller events/update (put) con evento: ${request.params.event}`);
}

module.exports  =   { index, store, update };