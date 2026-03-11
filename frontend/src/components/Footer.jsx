import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/papers" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Papers
                </Link>
              </li>
              <li>
                <Link to="/notes" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Notes
                </Link>
              </li>
              {/* <li>
                <Link to="/discussions" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Discussions
                </Link>
              </li> */}
              <li>
                <Link to="/profile" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/papers" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Papers
                </Link>
              </li>
              <li>
                <Link to="/notes" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Notes
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Announcements
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Connect
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Gmail
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            © 2024 ExamVault. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

