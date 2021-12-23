package code;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

public class Servlet extends HttpServlet {
    static String prefix1 = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n";
    static String prefix2 = "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n";
    static String prefix3 = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n";
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/plain;charset=UTF-8");
        PrintWriter out = response.getWriter();
        String ontoFile = request.getParameter("f");
        if(ontoFile == null) {
            ontoFile = "resources/software-ontology.owl";
        }
        String theQuery = request.getParameter("q");
        if(theQuery == null) theQuery = "SELECT DISTINCT ?aclass ?label WHERE { ?aclass rdf:type owl:Class; rdfs:label ?label .FILTER(!isBlank(?aclass)).FILTER(lang(?label) = \"ru\")} ORDER BY ?label";
        theQuery = prefix1 + prefix2 + prefix3 + theQuery;
        String result = "{}";
        try {
            result = new JenaDo().execSelect(ontoFile, theQuery, true);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            out.println(result);
            out.close();
        }
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
    {
        resp.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Allow-Credentials, Cache-control, X-Requested-With, Content-Type, Accept,Origin");
        resp.setHeader("Access-Control-Allow-Methods", "GET,POST,HEAD");
        resp.setHeader("Access-Control-Allow-Credentials","true");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String clientOrigin = request.getHeader("origin");
        String graph = request.getParameter("ontofile");
        String ontoFile = "resources/" + graph + ".owl";
        String theQuery = request.getParameter("query");
        response.setContentType("text/plain;charset=UTF-8");
        response.setHeader("Cache-control", "no-cache, no-store");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Access-Control-Allow-Origin", clientOrigin);
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        theQuery = prefix1 + prefix2 + prefix3 + theQuery;
        String result = "{}";
        try {
            result = new JenaDo().execSelect(ontoFile, theQuery, false);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            out.print(result);
            out.close();
        }
    }
}

