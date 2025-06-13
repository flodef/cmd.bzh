-- Create a reviews table with a unique UUID as both ID and validation token
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
  published BOOLEAN DEFAULT FALSE
);

-- Index for filtering published reviews
CREATE INDEX idx_reviews_published ON reviews(published);

-- Example query for getting all published reviews
-- SELECT * FROM reviews WHERE published = TRUE ORDER BY created_at DESC;

-- Test data - 10 dummy reviews
INSERT INTO reviews (id, name, email, comment, rating, published, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Sophie Dubois', 'sophie.d@example.com', 'J''ai été agréablement surprise par la qualité du service de nettoyage. L''équipe a été minutieuse et professionnelle.', 5.0, TRUE, NOW() - INTERVAL '5 days'),
('22222222-2222-2222-2222-222222222222', 'Jean Dupont', 'jean.d@example.com', 'Service très ponctuel et efficace. Je recommande!', 4.5, TRUE, NOW() - INTERVAL '10 days'),
('33333333-3333-3333-3333-333333333333', 'Marie Lefevre', 'marie.l@example.com', 'Excellent rapport qualité-prix. Les prestations sont conformes à mes attentes.', 5.0, TRUE, NOW() - INTERVAL '15 days'),
('44444444-4444-4444-4444-444444444444', 'Pierre Martin', 'pierre.m@example.com', 'L''entretien de mon jardin a été fait avec soin. Je suis très satisfait et je continuerai à faire appel à leurs services.', 4.5, TRUE, NOW() - INTERVAL '20 days'),
('55555555-5555-5555-5555-555555555555', 'Isabelle Blanc', 'isabelle.b@example.com', 'Service de qualité, personnel aimable. Un petit bémol sur les délais parfois un peu longs.', 3.5, TRUE, NOW() - INTERVAL '25 days'),
('66666666-6666-6666-6666-666666666666', 'Michel Durant', 'michel.d@example.com', 'J''apprécie particulièrement leur flexibilité et leur capacité à s''adapter à mes besoins spécifiques.', 4.0, TRUE, NOW() - INTERVAL '30 days'),
('77777777-7777-7777-7777-777777777777', 'Caroline Petit', 'caroline.p@example.com', 'Équipe très professionnelle. Le service de conciergerie m''a permis de gagner beaucoup de temps au quotidien.', 5.0, TRUE, NOW() - INTERVAL '35 days'),
('88888888-8888-8888-8888-888888888888', 'Laurent Moreau', 'laurent.m@example.com', 'Très bonne expérience globale. Service client réactif et prestations de qualité.', 4.0, TRUE, NOW() - INTERVAL '40 days'),
('99999999-9999-9999-9999-999999999999', 'Nathalie Roux', 'nathalie.r@example.com', 'Excellente prestation pour l''entretien de notre résidence secondaire. Service fiable et professionel.', 4.5, TRUE, NOW() - INTERVAL '45 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Thomas Martin', 'thomas.m@example.com', 'Très bon service de jardinage. Les équipes sont ponctuelles et soigneuses. Je recommande vivement.', 3.5, TRUE, NOW() - INTERVAL '50 days');

-- Unpublished review for testing approval
INSERT INTO reviews (id, name, email, comment, rating, published, created_at) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Test Unpublished', 'test@example.com', 'This is an unpublished review waiting for approval.', 3.5, FALSE, NOW());

-- Cleanup command to delete all test data
-- DELETE FROM reviews WHERE id IN (
--   '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 
--   '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 
--   '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 
--   '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', 
--   '99999999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
--   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
-- );

-- Cleanup command to delete all reviews
-- TRUNCATE TABLE reviews;
