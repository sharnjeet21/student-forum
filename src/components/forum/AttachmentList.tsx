import { Attachment } from '../../types'
import { apiService } from '../../services/apiService'

interface AttachmentListProps {
  attachments: Attachment[]
}

export const AttachmentList: React.FC<AttachmentListProps> = ({ attachments }) => {
  if (!attachments || attachments.length === 0) {
    return null
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimetype: string) => {
    if (mimetype === 'application/pdf') return '📄'
    if (mimetype.startsWith('image/')) return '🖼️'
    return '📎'
  }

  const handleDownload = (attachment: Attachment) => {
    const url = apiService.getFileUrl(attachment.filename)
    const link = document.createElement('a')
    link.href = url
    link.download = attachment.originalName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePreview = (attachment: Attachment) => {
    const url = apiService.getFileUrl(attachment.filename)
    window.open(url, '_blank')
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
        <span className="mr-2">📎</span>
        Attachments ({attachments.length})
      </h4>
      
      <div className="space-y-2">
        {attachments.map((attachment, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <span className="text-xl flex-shrink-0">
                {getFileIcon(attachment.mimetype)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">
                  {attachment.originalName}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              {attachment.mimetype.startsWith('image/') || attachment.mimetype === 'application/pdf' ? (
                <button
                  onClick={() => handlePreview(attachment)}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Preview
                </button>
              ) : null}
              
              <button
                onClick={() => handleDownload(attachment)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}