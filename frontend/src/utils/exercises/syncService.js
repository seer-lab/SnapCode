import { localRepo } from './localRepo';
import { cloudRepo } from './cloudRepo';

export const syncService = {
  async syncOne(readableUserId, exId) {
    if (!readableUserId) return { success: false, action: 'none', error: 'Not authenticated' };

    const local = localRepo.getOne(exId);
    const cloud = await cloudRepo.getOne(readableUserId, exId);

    if (local && !cloud) {
      await cloudRepo.upsert(readableUserId, exId, local);
      return { success: true, action: 'uploaded' };
    }
    if (!local && cloud) {
      localRepo.save(exId, cloud);
      return { success: true, action: 'downloaded' };
    }
    if (local && cloud) {
      const lt = new Date(local.lastUpdated || 0).getTime();
      const ct = new Date(cloud.lastUpdated || 0).getTime();
      if (lt > ct) {
        await cloudRepo.upsert(readableUserId, exId, local);
        return { success: true, action: 'uploaded' };
      } else if (ct > lt) {
        localRepo.save(exId, cloud);
        return { success: true, action: 'downloaded' };
      }
      return { success: true, action: 'already_synced' };
    }
    return { success: true, action: 'none' };
  },

  async syncAll(readableUserId) {
    if (!readableUserId) {
      return { success: false, uploaded: 0, downloaded: 0, synced: 0, errors: 1, error: 'Not authenticated' };
    }

    const localAll = localRepo.getAll();
    const cloudAll = await cloudRepo.listAll(readableUserId);

    const ids = new Set([...Object.keys(localAll), ...Object.keys(cloudAll)]);
    let uploaded = 0, downloaded = 0, synced = 0, errors = 0;

    for (const exId of ids) {
      try {
        const r = await this.syncOne(readableUserId, exId);
        if (!r.success) { errors++; continue; }
        if (r.action === 'uploaded') uploaded++;
        else if (r.action === 'downloaded') downloaded++;
        else if (r.action === 'already_synced') synced++;
      } catch {
        errors++;
      }
    }
    return { success: errors === 0, uploaded, downloaded, synced, errors };
  },

  async forceUploadAll(readableUserId) {
    if (!readableUserId) return { success: false, uploaded: 0, errors: 1, error: 'Not authenticated' };
    const localAll = localRepo.getAll();
    await cloudRepo.upsertMany(readableUserId, localAll);
    return { success: true, uploaded: Object.keys(localAll).length, errors: 0 };
  },

  async forceDownloadAll(readableUserId) {
    if (!readableUserId) return { success: false, downloaded: 0, error: 'Not authenticated' };
    const cloudAll = await cloudRepo.listAll(readableUserId);
    Object.entries(cloudAll).forEach(([exId, data]) => localRepo.save(exId, data));
    return { success: true, downloaded: Object.keys(cloudAll).length };
  },

  async getStatus(readableUserId, exId) {
    if (!readableUserId) return { synced: false, localOnly: true, cloudOnly: false, localNewer: false, cloudNewer: false };
    const local = localRepo.getOne(exId);
    const cloud = await cloudRepo.getOne(readableUserId, exId);

    if (local && !cloud) return { synced: false, localOnly: true, cloudOnly: false, localNewer: true, cloudNewer: false };
    if (!local && cloud) return { synced: false, localOnly: false, cloudOnly: true, localNewer: false, cloudNewer: true };
    if (local && cloud) {
      const lt = new Date(local.lastUpdated || 0).getTime();
      const ct = new Date(cloud.lastUpdated || 0).getTime();
      if (lt > ct) return { synced: false, localOnly: false, cloudOnly: false, localNewer: true, cloudNewer: false };
      if (ct > lt) return { synced: false, localOnly: false, cloudOnly: false, localNewer: false, cloudNewer: true };
      return { synced: true, localOnly: false, cloudOnly: false, localNewer: false, cloudNewer: false };
    }
    return { synced: false, localOnly: false, cloudOnly: false, localNewer: false, cloudNewer: false };
  }
};
