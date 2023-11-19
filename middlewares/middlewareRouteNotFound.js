module.exports  =   function(request, response, next)
                    {
                        response.status(404);
                        response.format(
                                        {
                                            html:       ()  =>
                                                {
                                                    response.type("html");
                                                    response.send(`<h1>Errore (404):    Rotta non trovata</h1>`);
                                                },
                                            default:    ()  =>
                                                {
                                                    response.json({ "Errore (404)"  :   "Rotta non trovata" });
                                                }
                                        });
                    }