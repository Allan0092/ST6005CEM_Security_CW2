import { 
  FaGithub, 
  FaTwitter, 
  FaDiscord, 
  FaEnvelope, 
  FaHeart
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="relative mt-auto"
      style={{
        background: "linear-gradient(135deg, #1a1827 0%, #151420 50%, #1a1827 100%)",
        borderTop: "1px solid rgba(148, 163, 184, 0.2)",
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 -left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(71, 85, 105, 0.4) 0%, transparent 70%)",
          }}
        ></div>
        <div
          className="absolute -bottom-1/2 -right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(100, 116, 139, 0.3) 0%, transparent 70%)",
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                style={{
                  background: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                }}
              >
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h3 className="text-2xl font-bold text-white">AnimeInfo</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Your ultimate destination for anime discovery, reviews, and community. 
              Track your favorites and explore the amazing world of anime.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/dashboard" 
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/search" 
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Search Anime
                </Link>
              </li>
              <li>
                <Link 
                  to="/favorites" 
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  My Favorites
                </Link>
              </li>
              <li>
                <Link 
                  to="/watchlist" 
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Watch List
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Connect With Us</h4>
            <div className="space-y-3 mb-6">
              <a
                href="mailto:support@animeinfo.com"
                className="text-slate-400 hover:text-white transition-colors duration-200 text-sm flex items-center"
              >
                <FaEnvelope className="mr-2" />
                support@animeinfo.com
              </a>
            </div>
            
            <div className="flex space-x-4">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 hover:scale-110"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.3)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              >
                <FaGithub />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 hover:scale-110"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.3)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 hover:scale-110"
                style={{
                  backgroundColor: "rgba(71, 85, 105, 0.3)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              >
                <FaDiscord />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div 
          className="border-t pt-8 flex flex-col md:flex-row justify-between items-center"
          style={{ borderColor: "rgba(148, 163, 184, 0.2)" }}
        >
          <div className="flex items-center mb-4 md:mb-0">
            <p className="text-slate-400 text-sm">
              © {currentYear} AnimeInfo. Made with{" "}
              <FaHeart className="inline text-red-400 mx-1" />
              for anime lovers.
            </p>
          </div>
          
          <div className="flex items-center space-x-6 text-xs text-slate-500">
            <span>v1.0.0</span>
            <span>Built with React</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;