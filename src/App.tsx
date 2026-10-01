import CampaignCard from './components/CampaignCard';
import CharacterCard from './components/CharacterCard';
import Layout from './components/Layout';
import PageHeader from './components/PageHeader';
import SessionEntry from './components/SessionEntry';

function App() {
    return (
        <Layout>
            <PageHeader title="Emberfall Keep" subtitle="Component preview">
                <a className="btn btn-primary" href="#">
                    <i className="fa-solid fa-dragon" /> Enter the Keep
                </a>
            </PageHeader>
            <main className="wrap">
                <CampaignCard
                    title="A Veil of Secrecy"
                    status="Active"
                    tagline="Something stirs beneath the keep."
                    sessionCount={4}
                    href="/campaigns/a-veil-of-secrecy"
                />
                <CharacterCard
                    name="Clover"
                    player="Player One"
                    race="Halfling"
                    characterClass="Rogue"
                    level={3}
                    href="/characters/clover"
                />
                <SessionEntry
                    title="Into the Mist"
                    sessionNumber={1}
                    date={new Date('2026-01-10')}
                    summary="The party arrives at Emberfall Keep."
                    partyPresent={['Clover', 'Mays']}
                    href="/sessions/session-001"
                />
            </main>
        </Layout>
    );
}

export default App;
