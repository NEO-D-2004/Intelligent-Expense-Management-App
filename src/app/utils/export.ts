import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '../types';
import { format } from 'date-fns';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export const exportToCSV = async (transactions: Transaction[]) => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Recurring'];
    const csvContent = [
        headers.join(','),
        ...transactions.map((t) =>
            [
                t.date,
                t.type,
                `"${t.category}"`, // Quote to handle commas
                `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
                t.amount.toFixed(2),
                t.isRecurring ? 'Yes' : 'No',
            ].join(',')
        ),
    ].join('\n');

    const fileName = `expenzo_transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;

    try {
        if (Capacitor.isNativePlatform()) {
            const result = await Filesystem.writeFile({
                path: fileName,
                data: csvContent,
                directory: Directory.Documents,
                encoding: Encoding.UTF8,
            });

            await Share.share({
                title: 'Export Transactions',
                text: 'Here are my transactions from Expenzo',
                url: result.uri,
                dialogTitle: 'Share CSV',
            });
        } else {
            // Web fallback
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        return true;
    } catch (error) {
        console.error('Error exporting CSV:', error);
        return false;
    }
};

export const exportToPDF = async (transactions: Transaction[]) => {
    const doc = new jsPDF();

    doc.text('Expenzo - Transaction Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 14, 28);

    const tableData = transactions.map((t) => [
        t.date,
        t.type,
        t.category,
        t.description,
        `$${t.amount.toFixed(2)}`,
        t.isRecurring ? 'Yes' : 'No',
    ]);

    autoTable(doc, {
        head: [['Date', 'Type', 'Category', 'Description', 'Amount', 'Recurring']],
        body: tableData,
        startY: 35,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 66, 66] },
    });

    const fileName = `expenzo_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;

    try {
        if (Capacitor.isNativePlatform()) {
            const pdfBase64 = doc.output('datauristring').split(',')[1];

            const result = await Filesystem.writeFile({
                path: fileName,
                data: pdfBase64,
                directory: Directory.Documents,
            });

            await Share.share({
                title: 'Export Report',
                text: 'Here is my transaction report from Expenzo',
                url: result.uri,
                dialogTitle: 'Share PDF',
            });
        } else {
            doc.save(fileName);
        }
        return true;
    } catch (error) {
        console.error('Error exporting PDF:', error);
        return false;
    }
};
