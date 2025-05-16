
import Layout from "@/components/layout/Layout";

const About = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About VolunteerMatch</h1>
        
        <div className="prose lg:prose-lg max-w-none">
          <p>
            VolunteerMatch is a platform dedicated to connecting passionate volunteers with organizations that need their help. 
            We believe that everyone has skills and time they can contribute to make our communities better places to live.
          </p>
          
          <h2>Our Mission</h2>
          <p>
            Our mission is to strengthen communities by making it easy for good people and good causes to connect. 
            We're dedicated to making volunteering accessible to everyone and helping organizations find the support they need to fulfill their missions.
          </p>
          
          <h2>How We Work</h2>
          <p>
            VolunteerMatch provides a simple but powerful platform where:
          </p>
          <ul>
            <li>
              <strong>Volunteers</strong> can create profiles highlighting their skills and interests, search for opportunities that match their passions, and connect directly with organizations.
            </li>
            <li>
              <strong>Organizations</strong> can create profiles, post volunteer opportunities, review applications, and communicate with potential volunteers.
            </li>
          </ul>
          
          <h2>Our Values</h2>
          <p>
            At VolunteerMatch, we are guided by these core values:
          </p>
          <ul>
            <li><strong>Community</strong> - We believe in the power of people coming together.</li>
            <li><strong>Accessibility</strong> - Volunteering should be accessible to everyone.</li>
            <li><strong>Impact</strong> - We focus on creating meaningful change.</li>
            <li><strong>Connection</strong> - We foster genuine relationships between volunteers and organizations.</li>
          </ul>
          
          <h2>Join Us</h2>
          <p>
            Whether you're looking to volunteer or you're an organization seeking help, we invite you to join our community and be part of the positive change we're creating together.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;
