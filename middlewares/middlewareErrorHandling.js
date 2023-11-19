module.exports  =   function(error, request, response, next)
                    {
                        response.status(500);
                        response.format(
                                        {
                                            html:       ()  =>
                                                {
                                                    response.type("html");
                                                    response.send(`<h1>Errore (500) ${error.message}</h1>`);
                                                },
                                            json:       ()  =>
                                                {
                                                    response.json({ "Errore 500"    :   error.message});
                                                },
                                            default:    ()  =>
                                                {
                                                    response.type("text");
                                                    response.send(`Errore (500)... ${error.message}`);
                                                }
                                        });
                    }