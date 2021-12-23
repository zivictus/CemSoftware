package code;

import org.apache.jena.query.*;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.sparql.resultset.ResultSetMem;
import org.apache.jena.util.FileManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;

public class JenaDo extends Object {
    @SuppressWarnings(value = "unused")
    private static final Logger log = LoggerFactory.getLogger(JenaDo.class);
    public static String  execSelect(String ontoFile, String theQuery, Boolean doget) throws Exception {
        Model model = ModelFactory.createDefaultModel();
        FileManager.get().readModel(model, ontoFile);
        Query query = QueryFactory.create(theQuery);
        QueryExecution queryExec = QueryExecutionFactory.create(query, model);
        String result = "{}";
        try {
            ResultSet theset = queryExec.execSelect();
            if(doget) {
                result = ResultSetFormatter.asText(theset);
            } else {
                ResultSetMem resultset = new ResultSetMem(theset);
//              resultset.rewind();
                ByteArrayOutputStream outStream = new ByteArrayOutputStream(4096);
                ResultSetFormatter.outputAsJSON(outStream, resultset);
                result = new String(outStream.toByteArray(),"UTF-8");
            }
        } finally {
            queryExec.close();
            return result;
        }
    }
}