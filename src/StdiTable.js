class StdiTable extends UIComponent {
	constructor(csvData, stubColumnCount, maxRowsByTable) {
		super()
		this.csvData = csvData
		this.stubColumnCount = stubColumnCount
		this.maxRowsByTable = maxRowsByTable

		this._rowRange = {
			from: 0,
			to: this.maxRowsByTable - 1
		}

		this._tableContainer = null
		this._navigation = null

		this._bodyPlusElement = null
		this._bodyElement = null

		this.selectingRowElement = null
		this.selectRowAction = (rowData, rowElement, rowIndex) => {}
	}

	rowRange(range) {
		if (range) {
			this._rowRange = range
			this.updateRowRange()
		}
		return this._rowRange
	}
	previousRange() {
		let from = Math.max(0, this.rowRange().from - this.maxRowsByTable),
			to = from + this.maxRowsByTable - 1
		this.rowRange({
			from: from,
			to: to
		})
	}
	nextRange() {
		let to = Math.min(this.rowRange().to + this.maxRowsByTable, this.csvData.data.length - 1),
			from = to - this.maxRowsByTable + 1
		this.rowRange({
			from: from,
			to: to
		})
	}
	createComponent() {
		let c = super.createComponent()
		this.tableContainer().appendTo(c)
		this.navigation().appendTo(c)
		return c
	}
	navigationRowRangeLabel() {
		if (this._navigationRowRangeLabel) {
			return this._navigationRowRangeLabel
		}
		this._navigationRowRangeLabel = document.createElement('label')
		return this._navigationRowRangeLabel
	}
	updateRowRange() {
		this.navigationRowRangeLabel().innerHTML = [this.rowRange().from + 1, this.rowRange().to + 1].join(' - ')
	}
	navigation() {
		if (this._navigation) {
			return this._navigation
		}
		let naviComponent = new UIComponent(),
			prevButton = ButtonComponent.PreviousButton((b) => {
				this.previousRange()
				this.updateTable()
			}),
			nextButton = ButtonComponent.NextButton((b) => {
				this.nextRange()
				this.updateTable()
			})
		this.updateRowRange()

		naviComponent.component().classList.add('navigation')
		prevButton.appendTo(naviComponent.component())
		naviComponent.component().appendChild(this.navigationRowRangeLabel())
		nextButton.appendTo(naviComponent.component())
		this._navigation = naviComponent
		return naviComponent
	}
	tableContainer() {
		if (!this._tableContainer) {
			this._tableContainer = new UIComponent()
			this._tableContainer.component().classList.add('tableContainer')
			if (this.csvData) {
				this._tableContainer.component().appendChild(this.bodyPlusElement())
			}
		}
		return this._tableContainer
	}
	bodyPlusElement() {
		if (this._bodyPlusElement) {
			return this._bodyPlusElement
		}
		let bodyPlusElement = this.createBodyPlusElement()
		let boxHeadElement = this.createBoxHeadElement()
		let body = this.bodyElement()
		let boxTailElement = this.createBoxTailElement()

		if (this.stubColumnCount > 0) {
			let stubElement = document.createElement('div')
			stubElement.className = 'stub'
			for (var columnIndex = 0; columnIndex < this.stubColumnCount; columnIndex += 1) {
				let columnElement = document.createElement('div')
				let isLastStub = columnIndex == this.stubColumnCount - 1
				columnElement.className = 'column'
				if (isLastStub) {
					columnElement.classList.add('last')
				}
				stubElement.appendChild(columnElement)
			}
			bodyPlusElement.appendChild(stubElement)
		}
		bodyPlusElement.appendChild(boxHeadElement)
		bodyPlusElement.appendChild(body)
		bodyPlusElement.appendChild(boxTailElement)
		this._bodyPlusElement = bodyPlusElement
		return this._bodyPlusElement
	}
	createBodyPlusElement() {
		let bodyPlusElement = document.createElement('div')
		bodyPlusElement.className = 'bodyPlus'
		return bodyPlusElement
	}
	createBoxHeadElement() {
		let rowDataArray = [this.csvData.header]
		let boxHeadElement = document.createElement('div')
		boxHeadElement.className = 'boxHead'
		rowDataArray.forEach((rowData) => {
			let headerElement = this.createRowElement(rowData, true)
			boxHeadElement.appendChild(headerElement)
		})
		return boxHeadElement
	}
	createBoxTailElement() {
		let boxTailElement = document.createElement('div')
		boxTailElement.className = 'boxTail';
		let footerElement = this.createRowElement(this.csvData.header.map((key) => {
			return ''
		}), true)
		boxTailElement.appendChild(footerElement)
		return boxTailElement
	}
	bodyElement() {
		if (this._bodyElement) {
			return this._bodyElement
		}
		let keys = this.csvData.header,
			csvRows = this.csvData.data
		this._bodyElement = document.createElement('div')
		this._bodyElement.className = 'body'
		let rowRange = this.rowRange()
		for (var row = rowRange.from; row <= rowRange.to; row += 1) {
			let rowData = csvRows[row]
			let values = keys.map((key) => {
				return rowData[key]
			})
			let rowElement = this.createRowElement(values, false, row)
			rowElement.addEventListener('click', this.createSelectRowAction(rowData, rowElement, row))
			this._bodyElement.appendChild(rowElement)
		}
		return this._bodyElement
	}
	createRowElement(values, _isHeader, rowIndex) {
		let isHeader = _isHeader == true
		let rowElement = document.createElement('div')
		rowElement.className = 'row'
		if (isHeader) {
			rowElement.classList.add('header')
		}
		values.forEach((value, columnIndex) => {
			let isStub = columnIndex < this.stubColumnCount
			let isLastStub = isStub && (columnIndex == this.stubColumnCount - 1)
			let cellElement = this.createCellElement(value, isStub, isLastStub)
			rowElement.appendChild(cellElement)
		})
		return rowElement
	}
	createSelectRowAction(rowData, rowElement, rowIndex) {
		return (e) => {
			if (this.selectingRowElement) {
				this.selectingRowElement.classList.remove('select')
			}
			this.selectingRowElement = rowElement
			this.selectingRowElement.classList.add('select')
			this.selectRowAction(rowData, rowElement, rowIndex)
		}
	}
	createCellElement(value, isStub, isLastStub) {
		let cellElement = document.createElement('div')
		cellElement.className = 'cell'
		if (isStub) {
			cellElement.classList.add('stub')
			if (isLastStub) {
				cellElement.classList.add('last')
			}
		}
		cellElement.innerHTML = value
		return cellElement
	}

	updateTable() {
		this.updateBodyPlus()
	}
	updateBodyPlus() {
		this.updateBody()
	}
	updateBody() {
		this.clearBodyElement()
		let keys = this.csvData.header
		let rowRange = this.rowRange()
		for (var row = rowRange.from; row <= rowRange.to; row += 1) {
			let rowData = this.csvData.data[row]
			let values = keys.map((key) => {
				return rowData[key]
			})
			let rowElement = this.createRowElement(values, false, this.stubColumnCount)
			rowElement.addEventListener('click', this.createSelectRowAction(rowData, rowElement, row))
			this.bodyElement().appendChild(rowElement)
		}
	}
	clearBodyElement() {
		while (this.bodyElement().childNodes.length > 0) {
			let node = this.bodyElement().childNodes.item(0)
			this.bodyElement().removeChild(node)
		}
	}
}
