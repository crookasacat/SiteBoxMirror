using System;
using System.Text;
using System.IO;
using Yahoo.Yui.Compressor;
using SiteBox.Common;

public partial class standalone : SiteBoxPage
{
    StringBuilder m_response = new StringBuilder();

    protected void Page_Load(object sender, EventArgs e)
    {
        PageInit("PUBLIC");
        
        String[] files = PageContext.GetContext("build_list", "").Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
        foreach (String url in files)
        {
            m_response.Append(processFile(url));
        }
        Response.ContentType = "text/plain";
        Response.Write(m_response.ToString());
        //only write if it is me!
        if (PageContext.GetContext("USER_NAME", "") == "rrh@crookasacat.com")
        {
            File.WriteAllText(Server.MapPath("jquery.SiteBoxMirror.standalone.min.js"), m_response.ToString());
        }
    }
    private String processFile(String url)
    {
        String path = Server.MapPath(url);
        String src = File.ReadAllText(path);
        String compressedSrc = JavaScriptCompressor.Compress(src);
        return "\n// " + url + "\n" + compressedSrc + "\n// end " + url + "\n\n";
    }
}
