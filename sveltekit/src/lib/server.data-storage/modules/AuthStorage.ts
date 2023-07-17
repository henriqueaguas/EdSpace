import { PrismaDataStorageComponent } from '../_TransactionalStorage';

export interface IAuthStorage {
	createSession(userId: string): Promise<tsession.Session>;
	deleteSession(sessionId: string): Promise<tsession.Session>;
}

export class PrismaAuthStorage extends PrismaDataStorageComponent implements IAuthStorage {
	createSession(userId: string) {
		const now = new Date();
		const expiresInADay = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() + 1,
			now.getHours(),
			now.getMinutes()
		);

		return this._prismaClient.session.create({
			data: {
				userId: userId,
				expires: expiresInADay
			}
		});
	}

	deleteSession(sessionId: string) {
		return this._prismaClient.session.delete({
			where: {
				id: sessionId
			}
		});
	}
}
