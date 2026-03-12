-- Supprimer le trigger automatique qui cause des conflits
-- On laissera le code React gérer l'ajout des membres

DROP TRIGGER IF EXISTS trigger_auto_add_channel_creator ON channels;
DROP FUNCTION IF EXISTS auto_add_channel_creator();

SELECT '✅ Trigger supprimé - Le code React gère maintenant tout' as result;
