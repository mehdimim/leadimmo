
-- MINISEED: 2 posts piliers publiés (EN)
INSERT INTO posts (id, created_at, updated_at, slug, title, status, excerpt, body_html, category, pillar, seo_json)
VALUES
('016753e1-c14b-4aeb-812e-41515e6b74ae', strftime('%s','now'), strftime('%s','now'),
 'koh-samui-luxury-villas-guide', 'Koh Samui Luxury Villas Investment Guide', 'published',
 'Understand the villa submarkets that drive premium yields on Koh Samui.',
 '<p>Koh Samui offers distinct villa clusters shaped by access, view corridors and rental demand.</p>',
 'investment', 1, json('{"keywords":["koh samui villas","luxury villa investment","bophut property"]}')),
('a624affb-2382-42d3-95e2-5706e1549e88', strftime('%s','now'), strftime('%s','now'),
 'koh-samui-beachfront-land-2024', 'Beachfront Land Outlook 2024', 'published',
 'Map out the remaining A-grade beachfront plots before the new marina reshapes supply.',
 '<p>Beachfront plots remain scarce. New tourism infrastructure around Bang Rak marina is compressing timelines.</p>',
 'market', 1, json('{"keywords":["samui beachfront land","resort development thailand","bang rak marina"]}'))
ON CONFLICT(slug) DO NOTHING;
