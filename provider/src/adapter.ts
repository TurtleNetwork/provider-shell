import {
    SignedTx,
    SignerAliasTx,
    SignerBurnTx,
    SignerCancelLeaseTx,
    SignerDataTx,
    SignerInvokeTx,
    SignerIssueTx,
    SignerLeaseTx,
    SignerMassTransferTx,
    SignerReissueTx,
    SignerSetAssetScriptTx,
    SignerSetScriptTx,
    SignerSponsorshipTx,
    SignerTransferTx,
    SignerTx,
} from '@turtlenetwork/signer';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { json } from '@waves/marshall';

function moneyFactory(amount: number | string, assetId: string | null = 'TN'): TurtleShell.IMoneyAmount {
    return {
        amount,
        assetId: assetId ?? 'TN',
    };
}

function defaultsFactory(tx: SignerTx): TurtleShell.ITransactionBase {
    const { fee } = tx;
    let feeAssetId;

    if (tx.type === TRANSACTION_TYPE.TRANSFER || tx.type === TRANSACTION_TYPE.INVOKE_SCRIPT) {
        ({ feeAssetId } = tx);
    }

    return {
        ...(fee ? { fee: moneyFactory(fee, feeAssetId) } : {}),
    };
}

function issueAdapter(tx: SignerIssueTx): TurtleShell.TIssueTxData {
    const { name, description, quantity, decimals, reissuable, script } = tx;
    const data: TurtleShell.IIssueTx = {
        ...defaultsFactory(tx),
        name,
        description: description ?? '',
        quantity,
        precision: decimals,
        reissuable: reissuable ?? false,
        ...(script ? { script } : {}),
    };
    return { type: TRANSACTION_TYPE.ISSUE, data };
}

function transferAdapter(tx: SignerTransferTx): TurtleShell.TTransferTxData {
    const { amount, assetId, fee, feeAssetId, recipient, attachment } = tx;
    const data: TurtleShell.ITransferTx = {
        ...defaultsFactory(tx),
        amount: moneyFactory(amount, assetId),
        recipient,
        ...(attachment ? { attachment } : {}),
        ...(fee ? { fee: moneyFactory(fee, feeAssetId) } : {}),
    };
    return { type: TRANSACTION_TYPE.TRANSFER, data };
}

function reissueAdapter(tx: SignerReissueTx): TurtleShell.TReissueTxData {
    const { assetId, quantity, reissuable } = tx;
    const data: TurtleShell.IReissueTx = {
        ...defaultsFactory(tx),
        assetId,
        quantity,
        reissuable,
    };
    return { type: TRANSACTION_TYPE.REISSUE, data };
}

function burnAdapter(tx: SignerBurnTx): TurtleShell.TBurnTxData {
    const { assetId, amount } = tx;
    const data: TurtleShell.IBurnTx = {
        ...defaultsFactory(tx),
        assetId,
        amount,
    };
    return { type: TRANSACTION_TYPE.BURN, data };
}

function leaseAdapter(tx: SignerLeaseTx): TurtleShell.TLeaseTxData {
    const { recipient, amount } = tx;
    const data: TurtleShell.ILeaseTx = {
        ...defaultsFactory(tx),
        recipient,
        amount,
    };
    return { type: TRANSACTION_TYPE.LEASE, data };
}

function leaseCancelAdapter(tx: SignerCancelLeaseTx): TurtleShell.TLeaseCancelTxData {
    const { leaseId } = tx;
    const data: TurtleShell.ILeaseCancelTx = {
        ...defaultsFactory(tx),
        leaseId,
    };
    return { type: TRANSACTION_TYPE.CANCEL_LEASE, data };
}

function aliasAdapter(tx: SignerAliasTx): TurtleShell.TCreateAliasTxData {
    const { alias } = tx;
    const data: TurtleShell.ICreateAliasTx = {
        ...defaultsFactory(tx),
        alias,
    };
    return { type: TRANSACTION_TYPE.ALIAS, data };
}

function massTransferAdapter(tx: SignerMassTransferTx): TurtleShell.TMassTransferTxData {
    const { assetId, transfers, attachment } = tx;
    const data: TurtleShell.IMassTransferTx = {
        ...defaultsFactory(tx),
        totalAmount: moneyFactory(0, assetId),
        transfers: transfers as Array<TurtleShell.ITransfer>,
        ...(attachment ? { attachment } : {}),
    };
    return { type: TRANSACTION_TYPE.MASS_TRANSFER, data };
}

function dataAdapter(tx: SignerDataTx): TurtleShell.TDataTxData {
    const { data } = tx;
    const dataTx: TurtleShell.IDataTx = {
        ...defaultsFactory(tx),
        data: data as Array<TurtleShell.TData>,
    };
    return { type: TRANSACTION_TYPE.DATA, data: dataTx };
}

function setScriptAdapter(tx: SignerSetScriptTx): TurtleShell.TSetScriptTxData {
    const { script } = tx;
    const data: TurtleShell.ISetScriptTx = {
        ...defaultsFactory(tx),
        script,
    };
    return { type: TRANSACTION_TYPE.SET_SCRIPT, data };
}

function sponsorshipAdapter(tx: SignerSponsorshipTx): TurtleShell.TSponsoredFeeTxData {
    const { assetId, minSponsoredAssetFee } = tx;
    const data: TurtleShell.ISponsoredFeeTx = {
        ...defaultsFactory(tx),
        minSponsoredAssetFee: moneyFactory(minSponsoredAssetFee, assetId),
    };
    return { type: TRANSACTION_TYPE.SPONSORSHIP, data };
}

function setAssetScriptAdapter(tx: SignerSetAssetScriptTx): TurtleShell.TSetAssetScriptTxData {
    const { assetId, script } = tx;
    const data: TurtleShell.ISetAssetScriptTx = {
        ...defaultsFactory(tx),
        assetId,
        script,
    };
    return { type: TRANSACTION_TYPE.SET_ASSET_SCRIPT, data };
}

function invokeScriptAdapter(tx: SignerInvokeTx): TurtleShell.TScriptInvocationTxData {
    const { dApp, fee, feeAssetId, payment, call } = tx;
    const data: TurtleShell.IScriptInvocationTx = {
        ...defaultsFactory(tx),
        dApp,
        ...(call ? { call: call as TurtleShell.ICall } : {}),
        ...(payment ? { payment: payment as Array<TurtleShell.TMoney> } : {}),
        ...(fee ? { fee: moneyFactory(fee, feeAssetId) } : {}),
    };
    return { type: TRANSACTION_TYPE.INVOKE_SCRIPT, data };
}

export function keeperTxFactory(tx: SignerIssueTx): TurtleShell.TIssueTxData;
export function keeperTxFactory(tx: SignerTransferTx): TurtleShell.TTransferTxData;
export function keeperTxFactory(tx: SignerReissueTx): TurtleShell.TReissueTxData;
export function keeperTxFactory(tx: SignerBurnTx): TurtleShell.TBurnTxData;
export function keeperTxFactory(tx: SignerLeaseTx): TurtleShell.TLeaseTxData;
export function keeperTxFactory(tx: SignerCancelLeaseTx): TurtleShell.TLeaseCancelTxData;
export function keeperTxFactory(tx: SignerAliasTx): TurtleShell.TCreateAliasTxData;
export function keeperTxFactory(tx: SignerMassTransferTx): TurtleShell.TMassTransferTxData;
export function keeperTxFactory(tx: SignerDataTx): TurtleShell.TDataTxData;
export function keeperTxFactory(tx: SignerSetScriptTx): TurtleShell.TSetScriptTxData;
export function keeperTxFactory(tx: SignerSponsorshipTx): TurtleShell.TSponsoredFeeTxData;
export function keeperTxFactory(tx: SignerSetAssetScriptTx): TurtleShell.TSetAssetScriptTxData;
export function keeperTxFactory(tx: SignerInvokeTx): TurtleShell.TScriptInvocationTxData;
export function keeperTxFactory(tx: SignerTx): TurtleShell.TSignTransactionData;
export function keeperTxFactory(tx) {
    switch (tx.type) {
        case TRANSACTION_TYPE.ISSUE:
            return issueAdapter(tx);
        case TRANSACTION_TYPE.TRANSFER:
            return transferAdapter(tx);
        case TRANSACTION_TYPE.REISSUE:
            return reissueAdapter(tx);
        case TRANSACTION_TYPE.BURN:
            return burnAdapter(tx);
        case TRANSACTION_TYPE.LEASE:
            return leaseAdapter(tx);
        case TRANSACTION_TYPE.CANCEL_LEASE:
            return leaseCancelAdapter(tx);
        case TRANSACTION_TYPE.ALIAS:
            return aliasAdapter(tx);
        case TRANSACTION_TYPE.MASS_TRANSFER:
            return massTransferAdapter(tx);
        case TRANSACTION_TYPE.DATA:
            return dataAdapter(tx);
        case TRANSACTION_TYPE.SET_SCRIPT:
            return setScriptAdapter(tx);
        case TRANSACTION_TYPE.SPONSORSHIP:
            return sponsorshipAdapter(tx);
        case TRANSACTION_TYPE.SET_ASSET_SCRIPT:
            return setAssetScriptAdapter(tx);
        case TRANSACTION_TYPE.INVOKE_SCRIPT:
            return invokeScriptAdapter(tx);
        default:
            throw new Error('Unsupported transaction type');
    }
}

export function signerTxFactory(signed: string): SignedTx<SignerTx> {
    return json.parseTx(signed);
}
