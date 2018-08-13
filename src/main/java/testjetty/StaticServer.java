package testjetty;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.DefaultServlet;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;

public class StaticServer {
	public static void main(String[] args) throws Exception {
		int port = 8090;
		if (args != null && args.length != 0 && args[0] != null) {
			try {
				port = Integer.parseInt(args[0]);
			} catch (Exception e) {
			}
		}
		Server server = new Server(port);

		ServletContextHandler context = new ServletContextHandler();
		// context.setResourceBase("D:\\bimfiles\\Files");
		context.setResourceBase(Server.class.getResource("/webapps").toString());
		server.setHandler(context);

		DefaultServlet staticServlet = new DefaultServlet();

		context.addServlet(new ServletHolder(staticServlet), "/*");

		server.start();

		server.join();
	}
}
